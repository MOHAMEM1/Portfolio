"""
Routeur des paiements programmés (Pensions, Aides Sociales, Salaires récurrents).
CDC §4.7 / §6.6 — Paiements sociaux et programmés.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime, timezone, timedelta

from database.database import get_db
from database.models import ScheduledPayment, User
from dependencies import get_current_user

router = APIRouter(prefix="/scheduled-payments", tags=["Paiements Programmés"])


class ScheduledPaymentCreate(BaseModel):
    receiver: str = Field(..., description="Compte destinataire")
    amount: float = Field(..., gt=0, description="Montant en FCFA")
    frequency: str = Field(..., description="Fréquence: DAILY, WEEKLY, MONTHLY")
    description: str | None = Field(None, description="Motif du paiement (ex: Pension Retraite)")


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_scheduled_payment(
    data: ScheduledPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un paiement programmé récurrent (pensions, aides, salaires)."""
    valid_frequencies = ["DAILY", "WEEKLY", "MONTHLY"]
    if data.frequency.upper() not in valid_frequencies:
        raise HTTPException(status_code=400, detail=f"Fréquence invalide. Options: {valid_frequencies}")

    now = datetime.now(timezone.utc)
    if data.frequency.upper() == "DAILY":
        next_exec = now + timedelta(days=1)
    elif data.frequency.upper() == "WEEKLY":
        next_exec = now + timedelta(weeks=1)
    else:
        next_exec = now + timedelta(days=30)

    payment = ScheduledPayment(
        sender=current_user.username,
        receiver=data.receiver,
        amount=data.amount,
        frequency=data.frequency.upper(),
        description=data.description,
        next_execution=next_exec
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return {
        "status": "success",
        "message": f"Paiement programmé créé avec succès ({data.frequency.upper()}).",
        "payment_id": payment.id,
        "next_execution": payment.next_execution.isoformat()
    }


@router.get("/")
def list_scheduled_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lister tous les paiements programmés de l'utilisateur connecté."""
    payments = db.query(ScheduledPayment).filter(
        ScheduledPayment.sender == current_user.username
    ).order_by(ScheduledPayment.created_at.desc()).all()

    return [{
        "id": p.id,
        "receiver": p.receiver,
        "amount": p.amount,
        "frequency": p.frequency,
        "description": p.description,
        "next_execution": p.next_execution.isoformat() if p.next_execution else None,
        "status": p.status,
        "executions_count": p.executions_count,
        "created_at": p.created_at.isoformat() if p.created_at else None
    } for p in payments]


@router.put("/{payment_id}/pause")
def pause_scheduled_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre en pause un paiement programmé."""
    payment = db.query(ScheduledPayment).filter(
        ScheduledPayment.id == payment_id,
        ScheduledPayment.sender == current_user.username
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement programmé introuvable.")
    payment.status = "PAUSED"
    db.commit()
    return {"status": "success", "message": "Paiement programmé mis en pause."}


@router.put("/{payment_id}/resume")
def resume_scheduled_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reprendre un paiement programmé mis en pause."""
    payment = db.query(ScheduledPayment).filter(
        ScheduledPayment.id == payment_id,
        ScheduledPayment.sender == current_user.username
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement programmé introuvable.")
    payment.status = "ACTIVE"
    db.commit()
    return {"status": "success", "message": "Paiement programmé réactivé."}


@router.delete("/{payment_id}")
def cancel_scheduled_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Annuler définitivement un paiement programmé."""
    payment = db.query(ScheduledPayment).filter(
        ScheduledPayment.id == payment_id,
        ScheduledPayment.sender == current_user.username
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement programmé introuvable.")
    payment.status = "CANCELLED"
    db.commit()
    return {"status": "success", "message": "Paiement programmé annulé."}
