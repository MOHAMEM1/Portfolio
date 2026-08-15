import logging
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone

from database.models import User, Transaction, Entry, EntryTypeEnum, Account, AccountTypeEnum
from config import settings

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LedgerManager:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, username: str, hashed_password: str, pin_code: str = None, role: str = "USER") -> bool:
        # Check if exists
        existing_user = self.db.query(User).filter(User.username == username).first()
        if existing_user:
            return False
            
        new_user = User(
            username=username,
            hashed_password=hashed_password,
            pin_code=pin_code,
            role=role
        )
        self.db.add(new_user)
        self.db.flush() # CRITICAL: Flush to DB so Postgres recognizes the user before creating accounts
        
        from utils.iban import generate_iban
        
        # Create default COURANT account
        new_account = Account(
            id=f"{username}_COURANT",
            username=username,
            account_type=AccountTypeEnum.COURANT.value,
            iban=generate_iban()
        )
        self.db.add(new_account)
        
        self.db.commit()
        return True

    def get_user_by_username(self, username: str):
        return self.db.query(User).filter(User.username == username).first()

    def handle_failed_pin(self, username: str) -> int:
        user = self.get_user_by_username(username)
        if user:
            user.failed_pin_attempts += 1
            if user.failed_pin_attempts >= 3:
                user.status = "LOCKED"
            self.db.commit()
            return user.failed_pin_attempts
        return 0

    def reset_failed_pin(self, username: str):
        user = self.get_user_by_username(username)
        if user and user.failed_pin_attempts > 0:
            user.failed_pin_attempts = 0
            self.db.commit()

    def get_daily_spending(self, account_id: str) -> float:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        daily_debit = self.db.query(func.sum(Entry.amount)).join(Transaction).filter(
            Entry.account_id == account_id,
            Entry.entry_type == EntryTypeEnum.DEBIT.value,
            Transaction.timestamp >= today_start
        ).scalar() or 0.0
        return daily_debit

    def get_account_balance(self, account_id: str) -> float:
        # SUM(CREDIT) - SUM(DEBIT)
        credit = self.db.query(func.sum(Entry.amount)).filter(
            Entry.account_id == account_id,
            Entry.entry_type == EntryTypeEnum.CREDIT.value
        ).scalar() or 0.0
        
        debit = self.db.query(func.sum(Entry.amount)).filter(
            Entry.account_id == account_id,
            Entry.entry_type == EntryTypeEnum.DEBIT.value
        ).scalar() or 0.0
        
        return credit - debit

    def record_double_entry(self, debit_account: str, credit_account: str, amount: float, currency: str = settings.DEFAULT_CURRENCY, fee: float = 0.0, fee_account: str = "XAALISI_FEES", transaction_type: str = "TRANSFER", idempotency_key: str = None, external_reference: str = None, description: str = None, commit: bool = True, allow_negative: bool = False) -> bool:
        if amount <= 0:
            logger.error("Erreur : Le montant doit être supérieur à 0.")
            return False
            
        if fee < 0:
            logger.error("Erreur : Les frais doivent être positifs (>=0).")
            return False
            
        if idempotency_key:
            existing_tx = self.db.query(Transaction).filter(Transaction.idempotency_key == idempotency_key).first()
            if existing_tx:
                logger.info(f"Idempotency Hit : La transaction avec la clé {idempotency_key} a déjà été effectuée.")
                return True

        total_deduction = amount + fee
        
        try:
            # SECURITY FIX: Verrouillage de la ligne sur la BD (Row Lock) pour empêcher le Double Spending (Race conditions)
            if not debit_account.startswith("System_") and not debit_account.startswith("SYSTEM_"):
                # with_for_update blocke les requêtes parallèles sur cet expéditeur pendant quelques millisecondes
                user_lock = self.db.query(User).filter(User.username == debit_account).with_for_update().first()
                if not user_lock:
                    raise ValueError(f"Expéditeur {debit_account} introuvable.")
                
            if not debit_account.startswith("System_") and not debit_account.startswith("SYSTEM_"):
                current_balance = self.get_account_balance(debit_account)
                if current_balance < total_deduction and not allow_negative:
                    raise ValueError(f"Solde insuffisant : Fonds insuffisants (requis : {total_deduction} {currency}, frais inclus).")

            new_tx = Transaction(
                currency=currency,
                status="SETTLED",
                transaction_type=transaction_type,
                idempotency_key=idempotency_key,
                external_reference=external_reference,
                description=description
            )
            self.db.add(new_tx)
            self.db.flush() # Get the new_tx ID without committing the whole transaction

            debit_entry = Entry(
                transaction_id=new_tx.id,
                account_id=debit_account,
                amount=total_deduction,
                entry_type=EntryTypeEnum.DEBIT.value
            )
            self.db.add(debit_entry)

            credit_entry = Entry(
                transaction_id=new_tx.id,
                account_id=credit_account,
                amount=amount,
                entry_type=EntryTypeEnum.CREDIT.value
            )
            self.db.add(credit_entry)

            if fee > 0:
                fee_entry = Entry(
                    transaction_id=new_tx.id,
                    account_id=fee_account,
                    amount=fee,
                    entry_type=EntryTypeEnum.CREDIT.value
                )
                self.db.add(fee_entry)

            if commit:
                self.db.commit()
            else:
                self.db.flush()
            logger.info(f"Transaction effectuée avec succès ! ID : {new_tx.id[:8]}... | Montant : {amount} {currency}")
            return True

        except ValueError as ve:
            self.db.rollback()
            raise ve
        except Exception as e:
            self.db.rollback()
            logger.error(f"Erreur technique lors de la transaction : {e}")
            raise Exception("Erreur interne du serveur de paiement.")

    def get_account_history(self, account_id: str, skip: int = 0, limit: int = 100):
        entries = self.db.query(Entry).join(Transaction).filter(
            Entry.account_id == account_id
        ).order_by(Transaction.timestamp.desc()).offset(skip).limit(limit).all()
        
        res = []
        for e in entries:
            other_party = None
            for entry in e.transaction.entries:
                if entry.account_id != account_id and entry.account_id != "XAALISI_FEES":
                    other_party = entry.account_id
                    break
            res.append((
                e.transaction_id,
                e.entry_type,
                e.amount,
                e.transaction.timestamp,
                e.transaction.description,
                e.transaction.transaction_type,
                other_party
            ))
        return res
