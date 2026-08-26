from fastapi import APIRouter, Request, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
import logging

from database.database import get_db
from database.models import User
from transactions import TransactionService
import auth
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ussd", tags=["USSD Gateway (*123#)"])

@router.post("/", response_class=PlainTextResponse)
async def ussd_callback(request: Request, db: Session = Depends(get_db)):
    """
    Webhook standard pour les agrégateurs USSD (ex: Africa's Talking, Orange, Moov).
    Reçoit un payload de type 'application/x-www-form-urlencoded'.
    Renvoie un texte brut commençant par 'CON ' (Continuer) ou 'END ' (Terminer).
    """
    form_data = await request.form()
    
    # Données standard envoyées par les opérateurs
    session_id = form_data.get("sessionId", "")
    phone_number = form_data.get("phoneNumber", "")
    text = form_data.get("text", "")
    
    # 1. Identification de l'utilisateur (le numéro de tél = username dans notre système)
    user = db.query(User).filter(User.username == phone_number).first()
    if not user:
        return "END Compte XAALISI introuvable pour ce numero."
        
    tx_service = TransactionService(db)
    
    # 2. Parsing de l'arborescence (Les choix sont séparés par '*')
    # Ex: text == "2*07000*5000" (L'utilisateur a choisi 2, puis tapé 07000, puis 5000)
    inputs = text.split('*') if text else []
    level = len(inputs) if text else 0
    
    response = ""
    
    try:
        # MENU PRINCIPAL
        if level == 0:
            response = "CON Bienvenue sur XAALISI:\n"
            response += "1. Mon Solde\n"
            response += "2. Transfert d'argent\n"
            response += "3. Paiement Facture"
            
        # BRANCHE 1: SOLDE
        elif inputs[0] == "1":
            if level == 1:
                response = "CON Entrez votre code PIN secret:"
            elif level == 2:
                pin_code = inputs[1]
                if not auth.verify_password(pin_code, user.pin_code):
                    response = "END Code PIN incorrect. Au revoir."
                else:
                    balance = tx_service.get_balance(user.username)
                    response = f"END Votre solde actuel est de {balance} {settings.DEFAULT_CURRENCY}."
                    
        # BRANCHE 2: TRANSFERT
        elif inputs[0] == "2":
            if level == 1:
                response = "CON Entrez le numero du destinataire:"
            elif level == 2:
                response = f"CON Entrez le montant a envoyer ({settings.DEFAULT_CURRENCY}):"
            elif level == 3:
                response = f"CON Vous allez envoyer {inputs[2]} {settings.DEFAULT_CURRENCY} au {inputs[1]}.\nEntrez votre code PIN pour valider:"
            elif level == 4:
                receiver = inputs[1]
                amount = float(inputs[2])
                pin_code = inputs[3]
                
                if not auth.verify_password(pin_code, user.pin_code):
                    response = "END Code PIN incorrect. Transfert annule."
                else:
                    try:
                        tx_service.process_transfer(
                            sender=user.username,
                            receiver=receiver,
                            amount=amount,
                            description="Transfert via USSD",
                            # On utilise l'ID de session USSD comme Idempotency Key ! (Anti double-débit magique)
                            idempotency_key=f"USSD_{session_id}" 
                        )
                        response = f"END Succes! {amount} {settings.DEFAULT_CURRENCY} ont ete transferes au {receiver}."
                    except Exception as e:
                        response = f"END Erreur lors du transfert: {str(e)}"
                        
        # BRANCHE 3: PAIEMENT FACTURE
        elif inputs[0] == "3":
            if level == 1:
                response = "CON Choisissez le fournisseur:\n1. Eau\n2. Electricite"
            elif level == 2:
                response = "CON Entrez le numero de votre facture:"
            elif level == 3:
                response = "CON Entrez le montant de la facture:"
            elif level == 4:
                response = "CON Entrez votre code PIN pour valider:"
            elif level == 5:
                provider = "EAU" if inputs[1] == "1" else "ELECTRICITE"
                bill_ref = inputs[2]
                amount = float(inputs[3])
                pin_code = inputs[4]
                
                if not auth.verify_password(pin_code, user.pin_code):
                    response = "END Code PIN incorrect."
                else:
                    try:
                        tx_service.process_transfer(
                            sender=user.username,
                            receiver=f"SYSTEM_BILLS_{provider}",
                            amount=amount,
                            description=f"Facture USSD {provider}",
                            external_reference=bill_ref,
                            idempotency_key=f"USSD_BILL_{session_id}"
                        )
                        response = f"END Succes! Facture {provider} ({bill_ref}) payee."
                    except Exception as e:
                        response = f"END Erreur: {str(e)}"
                        
        else:
            response = "END Choix invalide. Au revoir."
            
    except ValueError:
        response = "END Saisie invalide. Veuillez n'entrer que des chiffres."
    except Exception as e:
        logger.error(f"Erreur Serveur USSD: {e}")
        response = "END Le service est temporairement indisponible."
        
    return response

from pydantic import BaseModel

class USSDInitiateRequest(BaseModel):
    phone: str

@router.post("/initiate-session")
def initiate_session(request: USSDInitiateRequest):
    """
    Endpoint for frontend to trigger USSD fallback.
    Returns the USSD shortcode.
    """
    # Mocking a session initiation
    return {
        "success": True,
        "session_code": "*123*77#",
        "message": "Veuillez composer ce code sur votre téléphone."
    }
