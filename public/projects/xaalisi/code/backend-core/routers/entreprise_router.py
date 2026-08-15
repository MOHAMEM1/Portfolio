from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, Field
from typing import List
import logging
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import User, RoleEnum
from dependencies import get_current_user, get_transaction_service
from transactions import TransactionService
from websocket_manager import manager
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/entreprise", tags=["Entreprise (B2B)"])

class SalaryPaymentItem(BaseModel):
    employee_username: str
    amount: float = Field(..., gt=0)

class BulkSalaryRequest(BaseModel):
    batch_reference: str
    payments: List[SalaryPaymentItem]

@router.post("/bulk-salaries")
async def pay_salaries(
    request: BulkSalaryRequest,
    x_idempotency_key: str = Header(None),
    current_user: User = Depends(get_current_user),
    tx_service: TransactionService = Depends(get_transaction_service),
    db: Session = Depends(get_db)
):
    """
    Paiement de masse (Bulk Payment) pour les salaires (Mines, Coton, Entreprises).
    """
    if current_user.role != RoleEnum.ENTREPRISE.value and current_user.role != RoleEnum.ADMIN.value:
        raise HTTPException(status_code=403, detail="Seules les ENTREPRISES peuvent faire des paiements de masse.")
        
    total_amount_required = 0
    # 1. Validation de la liste et calcul du total (avec frais)
    for item in request.payments:
        total_amount_required += item.amount + tx_service.calculate_fee(item.amount)
        
    # 2. Vérifier le solde de l'entreprise
    balance = tx_service.get_balance(current_user.username)
    if balance < total_amount_required:
        raise HTTPException(
            status_code=400, 
            detail=f"Solde insuffisant pour le batch. Requis: {total_amount_required} {settings.DEFAULT_CURRENCY}. Dispo: {balance} {settings.DEFAULT_CURRENCY}."
        )
        
    # 3. Vérification des bénéficiaires (Pré-validation pour éviter d'échouer au milieu)
    for item in request.payments:
        user = tx_service.ledger.get_user_by_username(item.employee_username)
        if not user:
            raise HTTPException(
                status_code=400, 
                detail=f"L'employé {item.employee_username} n'existe pas dans le système."
            )
            
    notifications = []
    
    # 4. Exécution atomique (un seul commit global en base de données)
    try:
        for item in request.payments:
            item_idemp_key = f"{x_idempotency_key}_{item.employee_username}" if x_idempotency_key else None
            tx_service.process_transfer(
                sender=current_user.username,
                receiver=item.employee_username,
                amount=item.amount,
                idempotency_key=item_idemp_key,
                description=f"Salaire {request.batch_reference}",
                external_reference=request.batch_reference,
                commit=False
            )
            # Préparer la notification websocket (à envoyer uniquement après le commit)
            notifications.append((
                f"Salaire reçu: {item.amount} {settings.DEFAULT_CURRENCY} de la part de {current_user.username}", 
                item.employee_username
            ))
            
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur lors du virement de masse : {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Le paiement de masse a échoué et a été entièrement annulé. Détail: {str(e)}"
        )

    # 5. Envoyer les notifications WebSockets après le commit réussi
    for msg, recipient in notifications:
        try:
            await manager.send_personal_message(msg, recipient)
        except Exception as ws_err:
            logger.warning(f"Impossible d'envoyer la notification WebSocket à {recipient}: {ws_err}")

    return {
        "status": "success",
        "message": f"Batch traité avec succès. {len(request.payments)} salaires envoyés de manière atomique."
    }

