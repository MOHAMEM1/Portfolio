from fastapi import APIRouter, Depends
from dependencies import get_current_user, get_transaction_service
from transactions import TransactionService
from database.models import User
from config import settings

router = APIRouter(prefix="/wallet", tags=["Wallet"])

@router.get("/balance")
def get_balance(
    current_user: User = Depends(get_current_user),
    tx_service: TransactionService = Depends(get_transaction_service)
):
    """
    Retourne le solde actuel de l'utilisateur connecté ainsi que son niveau KYC.
    """
    balance = tx_service.get_balance(current_user.username)
    daily_spent = tx_service.ledger.get_daily_spending(current_user.username)
    
    return {
        "account": current_user.username,
        "balance": balance,
        "currency": settings.DEFAULT_CURRENCY,
        "kyc_level": current_user.kyc_tier,
        "kyc_status": current_user.kyc_status,
        "daily_spent": daily_spent
    }
