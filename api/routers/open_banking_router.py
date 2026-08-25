from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from dependencies import get_current_user
from database.models import User, ApiCredential, WebhookSubscription
from schemas import WebhookSubscriptionRequest
import secrets
import hashlib
import uuid
from pydantic import BaseModel
import auth

router = APIRouter()

class TokenRequest(BaseModel):
    client_id: str
    client_secret: str

@router.post("/token")
def get_b2b_token(req: TokenRequest, db: Session = Depends(get_db)):
    """Authentification B2B pour obtenir un jeton d'accès Open Banking."""
    cred = db.query(ApiCredential).filter(ApiCredential.client_id == req.client_id).first()
    if not cred:
        raise HTTPException(status_code=401, detail="Client ID invalide.")
        
    secret_hash = hashlib.sha256(req.client_secret.encode()).hexdigest()
    if cred.client_secret_hash != secret_hash:
        raise HTTPException(status_code=401, detail="Client Secret incorrect.")
        
    access_token = auth.create_access_token(data={"sub": cred.username, "role": "API_PARTNER"})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/credentials")
def generate_api_credentials(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Génère un Client ID et un Client Secret (OAuth2) pour l'intégration Open Banking (B2B).
    """
    if current_user.role not in ["ENTREPRISE", "MARCHAND"]:
        raise HTTPException(status_code=403, detail="Seules les entreprises et marchands peuvent générer des clés d'API.")
        
    client_id = str(uuid.uuid4())
    client_secret = secrets.token_urlsafe(32)
    client_secret_hash = hashlib.sha256(client_secret.encode()).hexdigest()
    
    cred = ApiCredential(
        username=current_user.username,
        client_id=client_id,
        client_secret_hash=client_secret_hash
    )
    db.add(cred)
    db.commit()
    
    return {
        "client_id": client_id,
        "client_secret": client_secret,
        "message": "Stockez le secret en sécurité. Il ne sera plus jamais affiché."
    }

@router.post("/webhooks")
def register_webhook(req: WebhookSubscriptionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Enregistre un endpoint (URL) tiers pour recevoir des notifications en temps réel (ex: PAIEMENT_REÇU).
    """
    if current_user.role not in ["ENTREPRISE", "MARCHAND"]:
        raise HTTPException(status_code=403, detail="Seules les entreprises peuvent enregistrer des webhooks.")
        
    webhook_secret = secrets.token_urlsafe(16)
    
    sub = WebhookSubscription(
        username=current_user.username,
        event_type=req.event_type,
        target_url=req.target_url,
        secret_key=webhook_secret
    )
    db.add(sub)
    db.commit()
    
    return {
        "message": "Webhook B2B enregistré avec succès.",
        "target_url": req.target_url,
        "secret_key": webhook_secret,
        "event_type": req.event_type
    }
