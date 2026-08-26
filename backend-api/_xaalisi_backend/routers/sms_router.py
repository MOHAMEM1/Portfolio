from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.database import get_db
from database.models import User
from ledger import LedgerManager

router = APIRouter()

class InboundSMS(BaseModel):
    sender_phone: str
    message: str

class TwilioWebhookRequest(BaseModel):
    From: str
    Body: str

class SMSResponse(BaseModel):
    status: str
    reply: str

@router.post("/inbound", response_model=SMSResponse)
def handle_inbound_sms(sms: InboundSMS, db: Session = Depends(get_db)):
    """
    Simulates receiving an SMS and parsing commands.
    Supported commands:
    - SOLDE
    - TRANSFERT <montant> <destinataire>
    - FACTURE <fournisseur> <reference>
    """
    ledger = LedgerManager(db)
    
    # 1. Identifier l'utilisateur
    user = db.query(User).filter(User.username == sms.sender_phone).first()
    if not user:
        return SMSResponse(status="error", reply="Erreur: Numero non reconnu. Veuillez vous inscrire a XAALISI.")
        
    if user.status == "LOCKED":
        return SMSResponse(status="error", reply="Erreur: Votre compte est bloque. Veuillez contacter le support.")
        
    command = sms.message.strip().upper().split()
    if not command:
        return SMSResponse(status="error", reply="Erreur: Message vide.")
        
    cmd_type = command[0]
    
    # 2. Parse Commands
    if cmd_type == "SOLDE":
        balance = ledger.get_account_balance(user.username)
        return SMSResponse(status="success", reply=f"Votre solde XAALISI est de {balance:.2f} FCFA.")
        
    elif cmd_type == "TRANSFERT":
        if len(command) < 3:
            return SMSResponse(status="error", reply="Format: TRANSFERT <montant> <destinataire>")
            
        try:
            amount = float(command[1])
            receiver = command[2]
        except ValueError:
            return SMSResponse(status="error", reply="Erreur: Montant invalide.")
            
        # Security: Needs OTP or PIN for real transfer, but for MVP simulation we accept or ask for PIN
        # In a real SMS banking, we'd reply "Veuillez envoyer votre PIN pour confirmer le transfert de X à Y"
        # For simplicity in this endpoint:
        success = ledger.record_double_entry(
            debit_account=user.username,
            credit_account=receiver,
            amount=amount,
            description="Transfert via SMS"
        )
        if success:
            return SMSResponse(status="success", reply=f"Succes: {amount} FCFA transferes a {receiver}.")
        else:
            return SMSResponse(status="error", reply="Echec du transfert. Solde insuffisant ou erreur système.")
            
    elif cmd_type == "FACTURE":
        if len(command) < 3:
            return SMSResponse(status="error", reply="Format: FACTURE <fournisseur> <reference>")
            
        provider = command[1]
        reference = command[2]
        
        # Simulating bill payment
        amount = 5000.0 # Mock amount for the bill
        success = ledger.record_double_entry(
            debit_account=user.username,
            credit_account="System_Bank",
            amount=amount,
            description=f"Paiement facture {provider} - {reference}"
        )
        if success:
            return SMSResponse(status="success", reply=f"Succes: Facture {provider} de {amount} FCFA payee.")
        else:
            return SMSResponse(status="error", reply="Echec: Solde insuffisant.")
            
    else:
        return SMSResponse(status="error", reply="Commande non reconnue. Envoyez SOLDE, TRANSFERT ou FACTURE.")

@router.post("/twilio/webhook")
def twilio_webhook(req: TwilioWebhookRequest, db: Session = Depends(get_db)):
    """
    Mock d'un Webhook d'API Gateway (type Twilio) pour traiter les SMS entrants.
    Dans un environnement réel, on vérifierait la signature Twilio.
    """
    # On délègue la logique métier au handler interne existant
    sms_req = InboundSMS(sender_phone=req.From, message=req.Body)
    response = handle_inbound_sms(sms_req, db)
    
    # Twilio s'attend généralement à du TwiML en retour, mais pour le mock on retourne du JSON
    return {
        "status": response.status,
        "message": response.reply
    }
