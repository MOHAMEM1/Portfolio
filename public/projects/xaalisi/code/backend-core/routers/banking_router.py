from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from dependencies import get_current_user
from database.models import User, Account
from ledger import LedgerManager

from pydantic import BaseModel
import uuid
from typing import List

router = APIRouter()

class AccountCreate(BaseModel):
    account_type: str # EPARGNE, ENTREPRISE, etc.

class InternalTransfer(BaseModel):
    source_account_id: str
    target_account_id: str
    amount: float

@router.get("/me/dashboard")
def get_customer_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Renvoie une vue globale des finances du client (Dashboard Digital Banking)
    """
    ledger = LedgerManager(db)
    accounts = db.query(Account).filter(Account.username == current_user.username).all()
    
    accounts_data = []
    total_balance = 0.0
    
    for acc in accounts:
        balance = ledger.get_account_balance(acc.id)
        
        # Compatibility with legacy entries where account_id == username
        if acc.account_type == "COURANT":
            balance += ledger.get_account_balance(current_user.username)
            
        total_balance += balance
        accounts_data.append({
            "id": acc.id,
            "type": acc.account_type,
            "status": acc.status,
            "balance": balance,
            "iban": getattr(acc, "iban", None)
        })
        
    # If no accounts found (legacy user), create a mock object
    if not accounts_data:
        legacy_balance = ledger.get_account_balance(current_user.username)
        from utils.iban import generate_iban
        accounts_data.append({
            "id": f"{current_user.username}_COURANT",
            "type": "COURANT",
            "status": "ACTIVE",
            "balance": legacy_balance,
            "iban": generate_iban()
        })
        total_balance = legacy_balance
    # Calculate global daily spent across all accounts
    total_daily_spent = 0.0
    for acc in accounts_data:
        total_daily_spent += ledger.get_daily_spending(acc["id"])
    # Legacy fallback
    total_daily_spent += ledger.get_daily_spending(current_user.username)
        
    return {
        "user_info": {
            "username": current_user.username,
            "kyc_tier": current_user.kyc_tier,
            "status": current_user.status
        },
        "total_balance": total_balance,
        "daily_spent": total_daily_spent,
        "accounts": accounts_data
    }

@router.post("/accounts")
def create_account(req: AccountCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Créer un nouveau sous-compte pour l'utilisateur"""
    new_id = f"{current_user.username}_{req.account_type}_{str(uuid.uuid4())[:8]}"
    acc = Account(
        id=new_id,
        username=current_user.username,
        account_type=req.account_type,
        status="ACTIVE"
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return {"message": "Compte créé avec succès", "account_id": acc.id, "account_type": acc.account_type}

@router.delete("/accounts/{account_id}")
def delete_account(account_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Supprimer un sous-compte (ex: Compte Épargne)"""
    # Prevent deleting the main legacy account
    if account_id == current_user.username or account_id == f"{current_user.username}_COURANT":
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas supprimer votre compte courant principal.")
        
    acc = db.query(Account).filter(Account.id == account_id, Account.username == current_user.username).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Compte introuvable ou ne vous appartient pas.")
        
    # Check balance before deleting
    ledger = LedgerManager(db)
    balance = ledger.get_account_balance(acc.id)
    if balance > 0:
        raise HTTPException(status_code=400, detail="Veuillez vider le compte (solde à 0) avant de le supprimer.")
        
    db.delete(acc)
    db.commit()
    return {"message": "Compte supprimé avec succès."}

@router.post("/accounts/transfer")
def internal_transfer(req: InternalTransfer, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Transférer des fonds entre les comptes d'un même utilisateur"""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Montant invalide")
        
    ledger = LedgerManager(db)
    
    # Vérifier que le compte source appartient à l'utilisateur
    source = db.query(Account).filter(Account.id == req.source_account_id, Account.username == current_user.username).first()
    # Cas du compte legacy principal
    if not source and req.source_account_id != f"{current_user.username}_COURANT" and req.source_account_id != current_user.username:
         raise HTTPException(status_code=403, detail="Compte source introuvable ou ne vous appartient pas.")
         
    target = db.query(Account).filter(Account.id == req.target_account_id, Account.username == current_user.username).first()
    if not target and req.target_account_id != f"{current_user.username}_COURANT" and req.target_account_id != current_user.username:
         raise HTTPException(status_code=403, detail="Compte cible introuvable ou ne vous appartient pas.")
         
    # Resolving legacy names
    actual_source = current_user.username if req.source_account_id == f"{current_user.username}_COURANT" else req.source_account_id
    actual_target = current_user.username if req.target_account_id == f"{current_user.username}_COURANT" else req.target_account_id
    
    balance = ledger.get_account_balance(actual_source)
    if balance < req.amount:
        raise HTTPException(status_code=400, detail="Solde insuffisant.")
        
    # Atomic transfer
    try:
        from database.models import Transaction, Entry
        from datetime import datetime, timezone
        
        with db.begin_nested():
            tx = Transaction(
                transaction_type="TRANSFER",
                status="SETTLED",
                description=f"Transfert interne vers {req.target_account_id}"
            )
            db.add(tx)
            db.flush()
            
            e_out = Entry(transaction_id=tx.id, account_id=actual_source, amount=req.amount, entry_type="DEBIT")
            e_in = Entry(transaction_id=tx.id, account_id=actual_target, amount=req.amount, entry_type="CREDIT")
            db.add(e_out)
            db.add(e_in)
            
        db.commit()
        return {"status": "success", "message": "Transfert interne réussi"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur transfert: {str(e)}")

from typing import List
from schemas import BeneficiaryCreate, BeneficiaryResponse
from database.models import Beneficiary
from fastapi.responses import FileResponse
import os

@router.get("/beneficiaries", response_model=List[BeneficiaryResponse])
def get_beneficiaries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Renvoie la liste des bénéficiaires"""
    return db.query(Beneficiary).filter(Beneficiary.username == current_user.username).all()

@router.post("/beneficiaries", response_model=BeneficiaryResponse)
def add_beneficiary(beneficiary: BeneficiaryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Ajoute un nouveau bénéficiaire"""
    target = db.query(User).filter(User.username == beneficiary.beneficiary_account).first()
    if not target:
        raise HTTPException(status_code=404, detail="Le compte bénéficiaire n'existe pas dans XAALISI.")
        
    new_ben = Beneficiary(
        username=current_user.username,
        beneficiary_account=beneficiary.beneficiary_account,
        alias=beneficiary.alias
    )
    db.add(new_ben)
    db.commit()
    db.refresh(new_ben)
    return new_ben
    
@router.delete("/beneficiaries/{beneficiary_id}")
def delete_beneficiary(beneficiary_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Supprime un bénéficiaire"""
    ben = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id, Beneficiary.username == current_user.username).first()
    if not ben:
        raise HTTPException(status_code=404, detail="Bénéficiaire non trouvé.")
    db.delete(ben)
    db.commit()
    return {"message": "Bénéficiaire supprimé."}

@router.get("/me/statement")
def get_account_statement(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Téléchargement du relevé bancaire (Mock PDF)"""
    os.makedirs("uploads", exist_ok=True)
    pdf_path = f"uploads/releve_{current_user.username}.pdf"
    with open(pdf_path, "w") as f:
        f.write("%PDF-1.4\n%Mock PDF Content for XAALISI Bank Statement")
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"Releve_XAALISI_{current_user.username}.pdf")
