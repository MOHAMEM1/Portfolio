import logging
from fastapi import HTTPException, status
from config import settings
from database.models import User
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# Initialisation du client Redis pour l'anti-fraude
redis_client = None
try:
    import redis  # type: ignore
    try:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    except Exception as e:
        logger.error(f"Erreur de connexion Redis pour l'Anti-Fraude: {e}")
        redis_client = None
except ImportError:
    logger.warning("Le module 'redis' n'est pas installé. L'anti-fraude (Velocity) est désactivé.")

# Paramètres de l'Anti-Fraude
VELOCITY_LIMIT = 5          # Nombre max de transactions
VELOCITY_WINDOW = 180       # En X secondes (ex: 180s = 3 minutes)

def check_transaction_velocity(user: User, db: Session):
    """
    DÉSACTIVÉ TEMPORAIREMENT (Bypass) : 
    Vérifie si l'utilisateur fait trop de transactions rapidement (Velocity Check).
    """
    pass


# ============================================================
# RÈGLES AML (Anti-Money Laundering) — CDC §5.6
# ============================================================

# Seuils AML configurables
AML_HIGH_AMOUNT_THRESHOLD = 500000    # Montant suspect (> 500 000 FCFA)
AML_DAILY_CUMULATIVE_LIMIT = 2000000  # Cumul journalier suspect (> 2 000 000 FCFA)

def check_aml_rules(user: User, amount: float, transaction_type: str, db: Session):
    """
    DÉSACTIVÉ TEMPORAIREMENT (Bypass) :
    Vérifie les règles AML/anti-blanchiment pour une transaction.
    """
    return {"risk_score": 0, "alerts": [], "action": "CLEAR"}

