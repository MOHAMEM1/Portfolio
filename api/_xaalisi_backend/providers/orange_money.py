from .base import MobileMoneyProvider
from typing import Dict, Any
import hashlib
import hmac
import uuid
import logging

logger = logging.getLogger(__name__)

class OrangeMoneyAdapter(MobileMoneyProvider):
    def __init__(self, api_key: str, secret_key: str):
        self.api_key = api_key
        self.secret_key = secret_key

    def initiate_payment(self, phone_number: str, amount: float, reference: str) -> Dict[str, Any]:
        """
        Simule un appel API vers Orange Money.
        Dans un vrai scénario, on ferait un `requests.post(url, json=...)`
        """
        logger.info(f"[Orange Money API] Initiation de paiement pour {phone_number} | Montant: {amount} | Ref: {reference}")
        
        # Simulation d'une réponse de l'opérateur
        provider_ref = f"OM_{uuid.uuid4().hex[:8].upper()}"
        
        return {
            "status": "PENDING",
            "provider_reference": provider_ref,
            "message": "En attente de la confirmation USSD du client."
        }

    def verify_webhook_signature(self, payload: str, signature: str) -> bool:
        """
        Vérifie la signature HMAC (Replay protection & Authentication).
        """
        expected_signature = hmac.new(
            self.secret_key.encode('utf-8'), 
            payload.encode('utf-8'), 
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
