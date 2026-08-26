from abc import ABC, abstractmethod
from typing import Dict, Any

class MobileMoneyProvider(ABC):
    """
    Interface de base pour les intégrateurs Mobile Money (Orange, Moov, etc.)
    Ceci permet l'interopérabilité (Design Pattern: Adapter).
    """

    @abstractmethod
    def initiate_payment(self, phone_number: str, amount: float, reference: str) -> Dict[str, Any]:
        """
        Lance une demande de paiement vers le téléphone du client.
        Retourne la référence de la transaction côté opérateur.
        """
        pass

    @abstractmethod
    def verify_webhook_signature(self, payload: str, signature: str) -> bool:
        """
        Vérifie que le webhook reçu provient bien de l'opérateur.
        """
        pass
