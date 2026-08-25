from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
import logging
import json

from database.database import get_db
from database.models import Transaction, Entry, EntryTypeEnum, TransactionStatusEnum
from providers.orange_money import OrangeMoneyAdapter
from websocket_manager import manager
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["Webhooks & Mobile Money"])

import os

# Note: In production, these should be loaded from env variables
OM_ADAPTER = OrangeMoneyAdapter(
    api_key=os.getenv("OM_API_KEY", "mock_key"), 
    secret_key=os.getenv("OM_SECRET_KEY", "mock_secret_123")
)

@router.post("/orange-money")
async def orange_money_webhook(
    request: Request,
    x_om_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Webhook appelé par Orange Money lorsque le client valide le paiement USSD.
    """
    body_bytes = await request.body()
    body_str = body_bytes.decode('utf-8')
    
    # 1. Vérification de la signature (Sécurité)
    if not x_om_signature or not OM_ADAPTER.verify_webhook_signature(body_str, x_om_signature):
        if settings.ENVIRONMENT == "production":
            raise HTTPException(status_code=401, detail="Signature invalide ou absente.")
        else:
            # Pour les besoins du test en dev sans vraie signature, on bypass si la signature n'est pas fournie.
            logger.warning("Signature manquante ou invalide, mais on continue en mode DEV.")
        
    try:
        payload = json.loads(body_str)
        provider_ref = payload.get("provider_reference")
        internal_ref = payload.get("internal_reference") # L'ID de notre transaction PENDING
        status = payload.get("status") # SUCCESS ou FAILED
        amount = payload.get("amount")
        
        if not internal_ref or not status:
            raise HTTPException(status_code=400, detail="Payload invalide")
            
        # 2. Réconciliation : Trouver la transaction PENDING
        tx = db.query(Transaction).filter(
            Transaction.id == internal_ref,
            Transaction.status == TransactionStatusEnum.INITIATED.value
        ).first()
        
        if not tx:
            logger.error(f"Transaction {internal_ref} introuvable ou n'est plus PENDING.")
            return {"status": "ignored", "message": "Transaction non PENDING."}
            
        # 3. Validation et Double écriture si succès
        if status == "SUCCESS":
            tx.status = TransactionStatusEnum.SETTLED.value
            tx.external_reference = provider_ref
            
            # Récupération de l'utilisateur concerné depuis la description de façon robuste
            prefix = "Topup OM vers "
            if tx.description and tx.description.startswith(prefix):
                account_id = tx.description[len(prefix):].strip()
            else:
                raise HTTPException(status_code=400, detail="Format de description de transaction invalide.")
            
            # Création des entrées
            debit_entry = Entry(
                transaction_id=tx.id,
                account_id="SYSTEM_ORANGE_MONEY",
                amount=amount,
                entry_type=EntryTypeEnum.DEBIT.value
            )
            credit_entry = Entry(
                transaction_id=tx.id,
                account_id=account_id,
                amount=amount,
                entry_type=EntryTypeEnum.CREDIT.value
            )
            db.add(debit_entry)
            db.add(credit_entry)
            db.commit()
            
            # Notification Temps Réel (Websocket)
            await manager.send_personal_message(f"Votre compte a été rechargé de {amount} {settings.DEFAULT_CURRENCY} via Orange Money.", account_id)
            
            return {"status": "success"}
            
        elif status == "FAILED":
            tx.status = TransactionStatusEnum.FAILED.value
            tx.external_reference = provider_ref
            db.commit()
            return {"status": "success", "message": "Transaction marquée comme échouée."}
            
    except Exception as e:
        logger.error(f"Erreur Webhook Orange: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal Server Error")
