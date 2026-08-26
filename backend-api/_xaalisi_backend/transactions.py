from ledger import LedgerManager
from sqlalchemy.orm import Session
import logging
from config import settings

logger = logging.getLogger(__name__)

class TransactionService:
    """
    Couche Service (Business / Logic Layer): 
    Katnaddem l'khedma bin l'API w Database (LedgerManager).
    """
    def __init__(self, db: Session):
        self.ledger = LedgerManager(db)

    def calculate_fee(self, amount: float) -> float:
        return amount * 0.01

    def process_transfer(self, sender: str, receiver: str, amount: float, idempotency_key: str = None, description: str = "Transfert P2P", external_reference: str = None, commit: bool = True, allow_negative: bool = False) -> bool:
        if sender == receiver:
            raise ValueError("L'expéditeur et le destinataire ne peuvent pas être identiques.")
        if amount <= 0:
            raise ValueError("Le montant du transfert doit être supérieur à 0.")
            
        fee = self.calculate_fee(amount)
        total_deduction = amount + fee
        
        balance = self.get_balance(sender)
        if balance < total_deduction and not allow_negative:
            raise ValueError(f"Solde insuffisant ! Il vous faut {total_deduction} {settings.DEFAULT_CURRENCY} (frais inclus) alors que votre solde est de {balance} {settings.DEFAULT_CURRENCY}.")
            
        # SECURITY FIX: Trou Noir / Black Hole prevention 
        if not receiver.startswith("SYSTEM_"):
            user = self.ledger.get_user_by_username(receiver)
            if not user:
                raise ValueError(f"Le destinataire '{receiver}' n'existe pas ou la syntaxe est erronée.")

        try:
            success = self.ledger.record_double_entry(
                debit_account=sender,
                credit_account=receiver,
                amount=amount,
                fee=fee,
                transaction_type="TRANSFER",
                idempotency_key=idempotency_key,
                external_reference=external_reference,
                description=description,
                commit=commit,
                allow_negative=allow_negative
            )
            return success
        except ValueError as e:
            logger.warning(f"Transfert refusé (Business Logic): {e}")
            raise e
        except Exception as e:
            logger.error(f"Erreur lors du transfert : {e}")
            raise ValueError("Problème technique temporaire. Veuillez réessayer plus tard.")

    def process_deposit(self, agent_id: str, agent_role: str, account_id: str, amount: float, idempotency_key: str = None, commit: bool = True) -> bool:
        if amount <= 0:
            raise ValueError("Le montant doit être supérieur à 0.")
            
        if agent_id == account_id and agent_role != "ADMIN":
            raise ValueError("Un agent ne peut pas effectuer un dépôt sur son propre compte (Auto-Dépôt interdit).")
            
        # SECURITY FIX: Empêcher le dépôt dans le vide
        user = self.ledger.get_user_by_username(account_id)
        if not user:
            raise ValueError(f"Le compte '{account_id}' n'existe pas.")
            
        # SECURITY FIX: Finite Money
        if agent_role == "ADMIN":
            debit_account = "System_Bank"
        else:
            debit_account = agent_id
            agent_balance = self.get_balance(agent_id)
            if agent_balance < amount:
                raise ValueError(f"Fonds insuffisants ! Votre compte Agent ne dispose que de {agent_balance} {settings.DEFAULT_CURRENCY}.")
        
        try:
            success = self.ledger.record_double_entry(
                debit_account=debit_account,
                credit_account=account_id,
                amount=amount,
                fee=0.0,
                transaction_type="DEPOSIT",
                idempotency_key=idempotency_key,
                description=f"Dépôt de cash par {agent_id}",
                commit=commit
            )
            return success
        except ValueError as e:
            logger.warning(f"Validation échouée lors du dépôt : {e}")
            raise e
        except Exception as e:
            logger.error(f"Erreur lors du dépôt : {e}")
            raise ValueError("Problème technique lors du dépôt.")

    def process_withdraw(self, account_id: str, amount: float, idempotency_key: str = None, commit: bool = True) -> bool:
        # Frais de 1% sur le retrait
        fee = amount * 0.01
        try:
            # Retrait: Les fonds quittent le portefeuille client vers System_Bank
            success = self.ledger.record_double_entry(
                debit_account=account_id,
                credit_account="System_Bank",
                amount=amount,
                fee=fee,
                transaction_type="WITHDRAWAL",
                idempotency_key=idempotency_key,
                description="Retrait depuis l'application",
                commit=commit
            )
            return success
        except ValueError as e:
            logger.warning(f"Retrait refusé : {e}")
            raise e
        except Exception as e:
            logger.error(f"Erreur lors du retrait : {e}")
            raise ValueError("Problème technique lors du retrait.")

    def get_balance(self, account_id: str) -> float:
        return self.ledger.get_account_balance(account_id)

    def get_history(self, account_id: str, skip: int = 0, limit: int = 100) -> list:
        # Récupération des données depuis la DB et formatage JSON.
        rows = self.ledger.get_account_history(account_id, skip=skip, limit=limit)
        history_list = []
        for row in rows:
            history_list.append({
                "transaction_id": row[0],
                "type": row[1],
                "amount": row[2],
                "date": row[3],
                "description": row[4],
                "transaction_type": row[5],
                "other_party": row[6]
            })
        return history_list
