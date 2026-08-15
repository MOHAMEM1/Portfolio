from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from dependencies import get_current_user
from database.models import User, Account, AccountTypeEnum
from schemas import MerchantEnrollRequest, QRCodeRequest, PaymentLinkRequest, QRPayRequest
from transactions import TransactionService
from dependencies import get_transaction_service
import uuid
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
import uuid

class NFCChargeRequest(BaseModel):
    amount: float
    card_number: str
    expiry: str
    cvv: str

class InvoiceRequest(BaseModel):
    customer_email: str
    amount: float
    description: str

router = APIRouter()

@router.post("/enroll")
def enroll_merchant(req: MerchantEnrollRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Convertit un utilisateur normal en Marchand (SoftPOS) et crée un compte MARCHAND dédié.
    """
    if current_user.role in ["ENTREPRISE", "MARCHAND"]:
        raise HTTPException(status_code=400, detail="L'utilisateur est déjà un marchand ou une entreprise.")
        
    # Promote user
    current_user.role = "MARCHAND"
    
    # Check if merchant account already exists
    existing_acc = db.query(Account).filter(Account.id == f"{current_user.username}_MARCHAND").first()
    if not existing_acc:
        new_account = Account(
            id=f"{current_user.username}_MARCHAND",
            username=current_user.username,
            account_type=AccountTypeEnum.MARCHAND.value
        )
        db.add(new_account)
    
    db.commit()
    
    return {"message": "Enrôlement marchand réussi.", "account_id": f"{current_user.username}_MARCHAND", "business_name": req.business_name}

@router.post("/qr-code")
def generate_qr_payload(req: QRCodeRequest, current_user: User = Depends(get_current_user)):
    """
    Génère un payload pour un QR Code dynamique (SoftPOS).
    """
    if current_user.role not in ["MARCHAND", "ENTREPRISE", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Seul un marchand peut générer un QR Code de paiement.")
        
    qr_payload = {
        "merchant": current_user.username,
        "amount": req.amount,
        "description": req.description,
        "qr_id": str(uuid.uuid4())
    }
    
    return {"qr_payload": qr_payload, "message": "Scannez ce payload pour payer."}

@router.post("/payment-link")
def generate_payment_link(req: PaymentLinkRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Génère un lien URL unique pour un paiement à distance.
    """
    if current_user.role not in ["MARCHAND", "ENTREPRISE", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Seul un marchand peut générer un lien de paiement.")
        
    link_id = str(uuid.uuid4())
    expiration = datetime.now(timezone.utc) + timedelta(hours=req.expires_in_hours)
    
    payment_url = f"https://xaalisi-frontend.com/pay/{link_id}"
    
    return {
        "payment_url": payment_url,
        "amount": req.amount,
        "expires_at": expiration.isoformat()
    }

@router.post("/invoice")
def create_invoice(req: InvoiceRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Génère une facture pour un client.
    """
    if current_user.role not in ["MARCHAND", "ENTREPRISE", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Seul un marchand peut générer une facture.")
        
    invoice_id = str(uuid.uuid4())
    # Simulation d'envoi d'email
    return {
        "message": f"Facture {invoice_id} générée et envoyée à {req.customer_email}",
        "invoice_id": invoice_id,
        "amount": req.amount,
        "status": "SENT"
    }

@router.post("/pay-qr")
def process_qr_payment(req: QRPayRequest, current_user: User = Depends(get_current_user), tx_service: TransactionService = Depends(get_transaction_service)):
    """
    Traite un paiement SoftPOS initié par scan de QR Code.
    Le sender est current_user, le receiver est merchant_username_MARCHAND.
    """
    import auth
    
    # Check pin
    if not auth.verify_password(req.pin_code, current_user.pin_code):
        raise HTTPException(status_code=400, detail="Code PIN incorrect")
        
    merchant_account_id = f"{req.merchant_username}_MARCHAND"
    sender_account_id = f"{current_user.username}_COURANT"
    
    success = tx_service.process_transfer(
        sender=sender_account_id,
        receiver=merchant_account_id,
        amount=req.amount,
        description=f"Paiement QR {req.qr_id}"
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Fonds insuffisants ou erreur de transfert.")
        
    return {"message": "Paiement SoftPOS réussi.", "amount": req.amount, "merchant": req.merchant_username}

@router.post("/nfc/charge")
def process_nfc_payment(req: NFCChargeRequest, current_user: User = Depends(get_current_user), tx_service: TransactionService = Depends(get_transaction_service)):
    """
    Simule un paiement NFC (Tap To Phone). 
    Le marchand scanne une carte sans contact (ici on passe les détails de carte).
    """
    if current_user.role not in ["MARCHAND", "ENTREPRISE"]:
        raise HTTPException(status_code=403, detail="Seul un marchand peut effectuer un encaissement NFC.")
        
    merchant_account_id = f"{current_user.username}_MARCHAND"
    
    # En production, on interrogerait le réseau Visa/Mastercard/GIM-UEMOA.
    # Ici on valide la transaction et on crédite le marchand.
    if not req.card_number or len(req.card_number) < 16:
        raise HTTPException(status_code=400, detail="Carte invalide.")
        
    # On simule un dépôt depuis la carte vers le compte marchand
    success = tx_service.process_deposit(merchant_account_id, req.amount)
    if not success:
        raise HTTPException(status_code=400, detail="Échec de la transaction NFC.")
        
    return {"message": "Paiement NFC (Tap To Phone) réussi.", "amount": req.amount, "card": f"****{req.card_number[-4:]}"}
