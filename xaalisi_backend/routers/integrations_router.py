from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from dependencies import get_current_user, get_transaction_service
from database.models import User
from transactions import TransactionService
from fastapi import Request
import re
import random

router = APIRouter()

@router.post("/pay-bill")
def pay_bill(provider: str, bill_reference: str, amount: float, current_user: User = Depends(get_current_user), db: Session = Depends(get_db), tx_service: TransactionService = Depends(get_transaction_service)):
    """
    Paiement de factures (Mock EDM, SOMAGEP, CANAL+).
    Transfère les fonds depuis le compte de l'utilisateur vers le compte du fournisseur.
    """
    valid_providers = ["EDM", "SOMAGEP", "CANAL_PLUS"]
    if provider.upper() not in valid_providers:
        raise HTTPException(status_code=400, detail=f"Fournisseur invalide. Options: {valid_providers}")
        
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Le montant doit être supérieur à zéro.")
        
    provider_account = f"SYSTEM_BILL_{provider.upper()}"
    
    try:
        tx_service.process_transfer(
            sender=current_user.username,
            receiver=provider_account,
            amount=amount,
            description=f"Paiement facture {provider.upper()} - Ref: {bill_reference}"
        )
        return {
            "status": "success",
            "message": f"Facture {bill_reference} ({provider.upper()}) payée avec succès."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/mobile-money/transfer")
def transfer_to_mobile_money(wallet_provider: str, phone_number: str, amount: float, current_user: User = Depends(get_current_user), db: Session = Depends(get_db), tx_service: TransactionService = Depends(get_transaction_service)):
    """
    Interopérabilité: Transfert de XAALISI vers Orange Money ou Wave (Mock).
    """
    valid_providers = ["ORANGE_MONEY", "WAVE"]
    if wallet_provider.upper() not in valid_providers:
        raise HTTPException(status_code=400, detail=f"Opérateur invalide. Options: {valid_providers}")
        
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Le montant doit être supérieur à zéro.")
        
    provider_account = f"SYSTEM_{wallet_provider.upper()}_OUT"
    
    try:
        # We simulate the money leaving the XAALISI ecosystem to the partner wallet
        tx_service.process_transfer(
            sender=current_user.username,
            receiver=provider_account,
            amount=amount,
            description=f"Transfert sortant vers {wallet_provider.upper()} ({phone_number})"
        )
        return {
            "status": "success",
            "message": f"Transfert de {amount} vers le compte {wallet_provider.upper()} ({phone_number}) initié avec succès."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/ocr/scan-bill")
async def scan_bill_ocr(request: Request, current_user: User = Depends(get_current_user)):
    """
    Mock OCR: Simulate reading a picture of a bill and extracting text via AI.
    """
    providers = ["EDM SA", "SOMAGEP", "Orange Mali", "Moov Africa"]
    amounts = [15000, 25000, 8500, 45000, 12000, 5000, 2500, 30000]
    
    return {
        "status": "success",
        "provider": random.choice(providers),
        "bill_reference": f"FACT-{random.randint(100000, 999999)}",
        "amount": random.choice(amounts),
        "confidence": 0.98
    }

@router.post("/iso20022/pain001")
async def process_iso20022_payment(request: Request, db: Session = Depends(get_db), tx_service: TransactionService = Depends(get_transaction_service)):
    """
    Mock ISO 20022 (pain.001) Credit Transfer.
    Accepts raw XML.
    """
    try:
        body = await request.body()
        xml_str = body.decode('utf-8')
        
        # Simple extraction using regex to avoid strict namespace issues
        dbtr_match = re.search(r'<DbtrAcct>.*?<Id>(.*?)</Id>', xml_str, re.DOTALL | re.IGNORECASE)
        cdtr_match = re.search(r'<CdtrAcct>.*?<Id>(.*?)</Id>', xml_str, re.DOTALL | re.IGNORECASE)
        amt_match = re.search(r'<InstdAmt.*?>(.*?)</InstdAmt>', xml_str, re.DOTALL | re.IGNORECASE)
        
        if not dbtr_match or not cdtr_match or not amt_match:
            raise HTTPException(status_code=400, detail="Format XML invalide. Balises DbtrAcct, CdtrAcct ou InstdAmt manquantes.")
            
        sender = dbtr_match.group(1).strip()
        receiver = cdtr_match.group(1).strip()
        amount = float(amt_match.group(1).strip())
        
        tx_service.process_transfer(
            sender=sender,
            receiver=receiver,
            amount=amount,
            description="Virement International ISO 20022 (pain.001)"
        )
        return {
            "status": "success",
            "message": "Virement ISO 20022 exécuté.",
            "details": {
                "sender": sender,
                "receiver": receiver,
                "amount": amount
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur ISO20022: {str(e)}")
