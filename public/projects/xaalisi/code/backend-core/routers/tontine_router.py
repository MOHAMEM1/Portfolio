from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging

from database.database import get_db
from database.models import User, TontineGroup, TontineMember, TontineStatusEnum, TontineFrequencyEnum
from dependencies import get_current_user, get_transaction_service
from transactions import TransactionService
from websocket_manager import manager
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tontines", tags=["Tontine Digitale (Darét)"])

class TontineCreateRequest(BaseModel):
    name: str = Field(..., description="Nom du groupe de Tontine")
    contribution_amount: float = Field(..., gt=0, description="Montant de la cotisation par cycle")
    frequency: str = Field(..., description="DAILY, WEEKLY, ou MONTHLY")

@router.post("/create")
async def create_tontine(
    request: TontineCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Créer un nouveau groupe de Tontine (Darét).
    Le créateur rejoint automatiquement le groupe en première position.
    """
    if request.frequency not in [e.value for e in TontineFrequencyEnum]:
        raise HTTPException(status_code=400, detail="Fréquence invalide.")
        
    # 1. Créer le groupe
    tontine = TontineGroup(
        name=request.name,
        creator_id=current_user.username,
        contribution_amount=request.contribution_amount,
        frequency=request.frequency
    )
    db.add(tontine)
    db.flush() # Pour avoir l'ID généré
    
    # 2. Ajouter le créateur comme premier membre
    member = TontineMember(
        tontine_id=tontine.id,
        username=current_user.username,
        payout_order=1
    )
    db.add(member)
    db.commit()
    
    return {
        "status": "success", 
        "message": f"Tontine '{tontine.name}' créée avec succès.",
        "tontine_id": tontine.id
    }

@router.post("/{tontine_id}/join")
async def join_tontine(
    tontine_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rejoindre un groupe de tontine existant."""
    tontine = db.query(TontineGroup).filter(TontineGroup.id == tontine_id).first()
    
    if not tontine:
        raise HTTPException(status_code=404, detail="Tontine introuvable.")
    if tontine.status != TontineStatusEnum.PENDING.value:
        raise HTTPException(status_code=400, detail="Cette tontine a déjà commencé ou est terminée.")
        
    existing_member = db.query(TontineMember).filter(
        TontineMember.tontine_id == tontine_id, 
        TontineMember.username == current_user.username
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="Vous êtes déjà membre de cette tontine.")
        
    # Trouver le dernier payout_order
    member_count = db.query(TontineMember).filter(TontineMember.tontine_id == tontine_id).count()
    next_order = member_count + 1
    
    new_member = TontineMember(
        tontine_id=tontine_id,
        username=current_user.username,
        payout_order=next_order
    )
    db.add(new_member)
    db.commit()
    
    # Notifier le créateur
    await manager.send_personal_message(f"Nouveau membre dans votre tontine '{tontine.name}': {current_user.username}", tontine.creator_id)
    
    return {"status": "success", "message": "Vous avez rejoint la tontine.", "payout_order": next_order}

@router.post("/{tontine_id}/start")
def start_tontine(
    tontine_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Démarrer la tontine (Réservé au créateur)."""
    tontine = db.query(TontineGroup).filter(TontineGroup.id == tontine_id).first()
    
    if not tontine:
        raise HTTPException(status_code=404, detail="Tontine introuvable.")
    if tontine.creator_id != current_user.username:
        raise HTTPException(status_code=403, detail="Seul le créateur peut démarrer la tontine.")
    if tontine.status != TontineStatusEnum.PENDING.value:
        raise HTTPException(status_code=400, detail="La tontine n'est pas en attente.")
        
    member_count = db.query(TontineMember).filter(TontineMember.tontine_id == tontine_id).count()
    if member_count < 2:
        raise HTTPException(status_code=400, detail="Il faut au moins 2 membres pour démarrer.")
        
    tontine.status = TontineStatusEnum.ACTIVE.value
    tontine.start_date = datetime.now(timezone.utc)
    db.commit()
    
    return {"status": "success", "message": f"La tontine '{tontine.name}' a démarré!"}

@router.post("/{tontine_id}/process-cycle")
async def process_tontine_cycle(
    tontine_id: str,
    x_idempotency_key: str = Header(None),
    current_user: User = Depends(get_current_user), # Peut être appelé par l'admin ou un cron
    db: Session = Depends(get_db),
    tx_service: TransactionService = Depends(get_transaction_service)
):
    """
    Traite un cycle complet de Tontine: 
    1. Collecte l'argent de tous les membres.
    2. Envoie le total au membre dont c'est le tour (current_cycle == payout_order).
    3. Passe au cycle suivant.
    """
    tontine = db.query(TontineGroup).filter(TontineGroup.id == tontine_id).with_for_update().first()
    if not tontine:
        raise HTTPException(status_code=404, detail="Tontine introuvable.")
        
    # SECURITY FIX: Restreindre l'appel au créateur ou à l'admin
    if tontine.creator_id != current_user.username and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=403, 
            detail="Seul le créateur du groupe de tontine ou un ADMIN peut déclencher un cycle."
        )
        
    if tontine.status != TontineStatusEnum.ACTIVE.value:
        raise HTTPException(status_code=400, detail="La tontine n'est pas active.")
        
    members = db.query(TontineMember).filter(TontineMember.tontine_id == tontine_id).all()
    member_count = len(members)
    
    # Trouver le bénéficiaire de ce cycle
    beneficiary = next((m for m in members if m.payout_order == tontine.current_cycle), None)
    if not beneficiary:
        raise HTTPException(status_code=500, detail="Bénéficiaire introuvable pour ce cycle.")
        
    total_pool = 0.0
    errors = []
    
    # 1. Collecter les cotisations (Tout ou rien dans une vraie implémentation robuste)
    # Pour l'instant on fait un best-effort, ou on pourrait avoir un compte de transit TONTINE_POOL
    pool_account = f"SYSTEM_TONTINE_POOL_{tontine.id}"
    
    for member in members:
        try:
            tx_service.process_transfer(
                sender=member.username,
                receiver=pool_account,
                amount=tontine.contribution_amount,
                idempotency_key=f"{x_idempotency_key}_collect_{tontine.current_cycle}_{member.username}" if x_idempotency_key else None,
                description=f"Cotisation Cycle {tontine.current_cycle} - Tontine {tontine.name}"
            )
            member.total_contributed += tontine.contribution_amount
            total_pool += tontine.contribution_amount
            
            await manager.send_personal_message(f"Votre cotisation de {tontine.contribution_amount} {settings.DEFAULT_CURRENCY} a été prélevée.", member.username)
        except Exception as e:
            logger.error(f"Echec prélèvement Tontine {member.username}: {e}")
            errors.append(member.username)
            # Gestion de défaut: Pénalité automatique (5% de la cotisation) prélevée même si solde négatif (découvert autorisé)
            penalty = tontine.contribution_amount * 0.05
            try:
                tx_service.process_transfer(
                    sender=member.username,
                    receiver="SYSTEM_TONTINE_PENALTY",
                    amount=penalty,
                    idempotency_key=f"{x_idempotency_key}_penalty_{tontine.current_cycle}_{member.username}" if x_idempotency_key else None,
                    description=f"Pénalité retard (Cycle {tontine.current_cycle}) - Tontine {tontine.name}",
                    allow_negative=True
                )
            except Exception as penalty_err:
                logger.error(f"Echec prélèvement pénalité pour {member.username}: {penalty_err}")
            
    if errors:
        logger.warning(f"Tontine {tontine.id}: Echecs pour {errors}. Pool partiel: {total_pool}")
        
    # 2. Payer le bénéficiaire
    if total_pool > 0:
        tx_service.process_transfer(
            sender=pool_account,
            receiver=beneficiary.username,
            amount=total_pool,
            idempotency_key=f"{x_idempotency_key}_payout_{tontine.current_cycle}_{beneficiary.username}" if x_idempotency_key else None,
            description=f"Gain Tontine {tontine.name} (Cycle {tontine.current_cycle})"
        )
        await manager.send_personal_message(f"Félicitations! Vous avez reçu le gain de la tontine: {total_pool} {settings.DEFAULT_CURRENCY}.", beneficiary.username)
        
    # 3. Avancer le cycle
    tontine.current_cycle += 1
    if tontine.current_cycle > member_count:
        tontine.status = TontineStatusEnum.COMPLETED.value
        
    db.commit()
    
    return {
        "status": "success",
        "message": f"Cycle {tontine.current_cycle - 1} terminé. Bénéficiaire: {beneficiary.username}. Pool: {total_pool}",
        "defauts": errors
    }

@router.get("/my")
def get_my_tontines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupère les tontines dont l'utilisateur est membre."""
    memberships = db.query(TontineMember).filter(TontineMember.username == current_user.username).all()
    tontine_ids = [m.tontine_id for m in memberships]
    tontines = db.query(TontineGroup).filter(TontineGroup.id.in_(tontine_ids)).all()
    return tontines

@router.get("/available")
def get_available_tontines(
    db: Session = Depends(get_db)
):
    """Récupère toutes les tontines en attente (PENDING) qui n'ont pas encore commencé."""
    tontines = db.query(TontineGroup).filter(TontineGroup.status == TontineStatusEnum.PENDING.value).all()
    return tontines
