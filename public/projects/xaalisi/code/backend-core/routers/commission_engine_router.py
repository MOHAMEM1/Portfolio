"""
Moteur de commissions configurable.
CDC §5.3 — Split configurable : XAALISI, Banque, Agent, Opérateur.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database.database import get_db
from database.models import CommissionConfig
from auth import require_role
from datetime import datetime, timezone

router = APIRouter(prefix="/commissions", tags=["Commission Engine"])

# Valeurs par défaut pour l'initialisation
DEFAULT_COMMISSIONS = [
    {"transaction_type": "TRANSFER", "xaalisi_pct": 0.5, "bank_pct": 0.2, "agent_pct": 0.2, "operator_pct": 0.1},
    {"transaction_type": "PAYMENT", "xaalisi_pct": 0.8, "bank_pct": 0.1, "agent_pct": 0.0, "operator_pct": 0.1},
    {"transaction_type": "DEPOSIT", "xaalisi_pct": 0.3, "bank_pct": 0.2, "agent_pct": 0.4, "operator_pct": 0.1},
    {"transaction_type": "WITHDRAWAL", "xaalisi_pct": 0.3, "bank_pct": 0.2, "agent_pct": 0.4, "operator_pct": 0.1},
    {"transaction_type": "TONTINE_CONTRIBUTION", "xaalisi_pct": 0.5, "bank_pct": 0.3, "agent_pct": 0.0, "operator_pct": 0.2},
    {"transaction_type": "BILL_PAYMENT", "xaalisi_pct": 0.6, "bank_pct": 0.2, "agent_pct": 0.0, "operator_pct": 0.2},
]


class CommissionUpdateRequest(BaseModel):
    xaalisi_pct: float = Field(..., ge=0, le=100, description="Part XAALISI en %")
    bank_pct: float = Field(..., ge=0, le=100, description="Part Banque en %")
    agent_pct: float = Field(..., ge=0, le=100, description="Part Agent en %")
    operator_pct: float = Field(..., ge=0, le=100, description="Part Opérateur Mobile Money en %")


@router.get("/config")
def get_commission_config(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("ADMIN"))
):
    """Récupérer la configuration actuelle des commissions (Admin uniquement)."""
    configs = db.query(CommissionConfig).all()
    
    # Si la table est vide, initialiser avec les valeurs par défaut
    if not configs:
        for default in DEFAULT_COMMISSIONS:
            db.add(CommissionConfig(**default))
        db.commit()
        configs = db.query(CommissionConfig).all()
    
    return [{
        "id": c.id,
        "transaction_type": c.transaction_type,
        "xaalisi_pct": c.xaalisi_pct,
        "bank_pct": c.bank_pct,
        "agent_pct": c.agent_pct,
        "operator_pct": c.operator_pct,
        "total_pct": round(c.xaalisi_pct + c.bank_pct + c.agent_pct + c.operator_pct, 2),
        "is_active": bool(c.is_active)
    } for c in configs]


@router.put("/config/{transaction_type}")
def update_commission_config(
    transaction_type: str,
    data: CommissionUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("ADMIN"))
):
    """Modifier la répartition des commissions pour un type de transaction (Admin uniquement)."""
    total = data.xaalisi_pct + data.bank_pct + data.agent_pct + data.operator_pct
    if abs(total - 1.0) > 0.01:
        raise HTTPException(
            status_code=400, 
            detail=f"La somme des pourcentages doit être égale à 1.0 (100%). Valeur actuelle: {total}"
        )
    
    config = db.query(CommissionConfig).filter(
        CommissionConfig.transaction_type == transaction_type.upper()
    ).first()
    
    if not config:
        raise HTTPException(status_code=404, detail=f"Configuration non trouvée pour le type '{transaction_type}'.")
    
    config.xaalisi_pct = data.xaalisi_pct
    config.bank_pct = data.bank_pct
    config.agent_pct = data.agent_pct
    config.operator_pct = data.operator_pct
    config.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    return {
        "status": "success",
        "message": f"Commission pour '{transaction_type.upper()}' mise à jour.",
        "new_split": {
            "xaalisi": f"{data.xaalisi_pct * 100}%",
            "bank": f"{data.bank_pct * 100}%",
            "agent": f"{data.agent_pct * 100}%",
            "operator": f"{data.operator_pct * 100}%"
        }
    }


@router.get("/calculate/{transaction_type}/{amount}")
def calculate_commission(
    transaction_type: str,
    amount: float,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("ADMIN"))
):
    """Simuler le calcul des commissions pour un montant donné."""
    config = db.query(CommissionConfig).filter(
        CommissionConfig.transaction_type == transaction_type.upper()
    ).first()
    
    if not config:
        raise HTTPException(status_code=404, detail=f"Pas de configuration pour '{transaction_type}'.")
    
    # Commission globale fixée à 1% du montant (ajustable)
    commission_rate = 0.01
    total_commission = round(amount * commission_rate, 2)
    
    return {
        "transaction_type": transaction_type.upper(),
        "amount": amount,
        "total_commission": total_commission,
        "split": {
            "xaalisi": round(total_commission * config.xaalisi_pct, 2),
            "bank": round(total_commission * config.bank_pct, 2),
            "agent": round(total_commission * config.agent_pct, 2),
            "operator": round(total_commission * config.operator_pct, 2)
        },
        "currency": "FCFA"
    }
