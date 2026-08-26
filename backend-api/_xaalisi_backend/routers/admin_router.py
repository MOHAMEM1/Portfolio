from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User, RoleEnum, AdminAuditLog, Entry, EntryTypeEnum, Transaction
from dependencies import get_current_user
from pydantic import BaseModel
import logging
from datetime import datetime, timezone
from sqlalchemy import func

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Administration"])

def check_admin_role(current_user: User = Depends(get_current_user)):
    """Dependency that ensures only ADMIN can access these routes."""
    if current_user.role != RoleEnum.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les administrateurs ont accès à cet endpoint."
        )
    return current_user

@router.get("/users")
def get_all_users(
    skip: int = 0, 
    limit: int = 50,
    current_admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db)
):
    """Retrieve all internal user accounts. (Admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    # Excluding password and pin hashes
    return [{
        "username": u.username,
        "role": u.role,
        "status": u.status,
        "failed_pin_attempts": u.failed_pin_attempts,
        "kyc_tier": u.kyc_tier
    } for u in users]

@router.post("/users/{username}/unlock")
def unlock_user(
    username: str,
    current_admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db)
):
    """Refactored logic from LedgerManager to directly unlock User via Admin"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
        
    user.status = "ACTIVE"
    user.failed_pin_attempts = 0
    
    audit_log = AdminAuditLog(
        admin_username=current_admin.username,
        action_type="UNLOCK_USER",
        target_username=username
    )
    db.add(audit_log)
    db.commit()
    return {"status": "success", "message": f"L'utilisateur {username} a été déverrouillé avec succès."}

@router.post("/users/{username}/promote")
def promote_user(
    username: str,
    new_role: str,
    current_admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db)
):
    """Promote a standard USER to AGENT or ADMIN."""
    if new_role not in [RoleEnum.ADMIN.value, RoleEnum.AGENT.value, RoleEnum.USER.value]:
        raise HTTPException(status_code=400, detail="Ce rôle n'existe pas.")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
        
    user.role = new_role
    
    audit_log = AdminAuditLog(
        admin_username=current_admin.username,
        action_type=f"PROMOTE_TO_{new_role}",
        target_username=username
    )
    db.add(audit_log)
    db.commit()
    return {"status": "success", "message": f"Le rôle de {username} a été changé à {new_role}."}

@router.post("/users/{username}/kyc-upgrade")
def upgrade_user_kyc(
    username: str,
    new_tier: int,
    current_admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db)
):
    """Met à jour le niveau KYC d'un utilisateur après vérification de ses documents."""
    if new_tier not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="KYC Tier invalide (1, 2, ou 3).")
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
        
    user.kyc_tier = new_tier
    
    audit_log = AdminAuditLog(
        admin_username=current_admin.username,
        action_type=f"UPGRADE_KYC_TIER_{new_tier}",
        target_username=username
    )
    db.add(audit_log)
    db.commit()
    return {"status": "success", "message": f"Niveau KYC de {username} mis à jour au Tier {new_tier}."}

@router.get("/dashboard/kpis")
def get_dashboard_kpis(
    current_admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db)
):
    """Récupérer les KPIs pour le tableau de bord de l'État / Administrateurs."""
    
    # 1. Utilisateurs
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "ACTIVE").count()
    
    # 2. Volume Financier (Total Fees Collectées)
    # Dans XAALISI, les frais vont dans le compte Système
    credits = db.query(func.sum(Entry.amount)).filter(
        Entry.account_id == "XAALISI_FEES",
        Entry.entry_type == EntryTypeEnum.CREDIT.value
    ).scalar() or 0.0
    debits = db.query(func.sum(Entry.amount)).filter(
        Entry.account_id == "XAALISI_FEES",
        Entry.entry_type == EntryTypeEnum.DEBIT.value
    ).scalar() or 0.0
    total_fees_collected = credits - debits
    
    # 3. Transactions du jour
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    tx_today_count = db.query(Transaction).filter(Transaction.timestamp >= today).count()
    
    # 4. Volume d'argent en circulation 
    # (Total de toutes les entrées créditées aux utilisateurs normaux)
    total_circulation = db.query(func.sum(Entry.amount)).filter(
        Entry.entry_type == EntryTypeEnum.CREDIT.value,
        ~Entry.account_id.startswith("SYSTEM_")
    ).scalar() or 0.0
    
    # 5. BI Metrics: Marchands et Volume global
    active_merchants = db.query(User).filter(User.role.in_(["MARCHAND", "ENTREPRISE"])).count()
    total_volume = db.query(func.sum(Entry.amount)).filter(
        Entry.entry_type == EntryTypeEnum.CREDIT.value
    ).scalar() or 0.0
    
    return {
        "status": "success",
        "data": {
            "total_users": total_users,
            "active_users": active_users,
            "active_merchants": active_merchants,
            "total_fees_collected_fcfa": total_fees_collected,
            "transactions_today": tx_today_count,
            "total_circulation_fcfa": total_circulation,
            "total_volume_fcfa": total_volume
        }
    }

class KYCVerificationRequest(BaseModel):
    action: str  # "APPROVE" or "REJECT"

@router.get("/kyc/pending")
def get_pending_kyc_users(
    current_admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(User.kyc_status == "PENDING").all()
    return [{
        "username": u.username,
        "role": u.role,
        "kyc_tier": u.kyc_tier,
        "kyc_status": u.kyc_status,
        "kyc_doc_path": u.kyc_doc_path
    } for u in users]

@router.post("/kyc/verify/{username}")
def verify_user_kyc(
    username: str,
    request: KYCVerificationRequest,
    current_admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
        
    if request.action == "APPROVE":
        user.kyc_status = "APPROVED"
        user.kyc_tier = 2  # Promote to Tier 2 on approval
        action_type = "KYC_VERIFY_APPROVED"
        msg = f"Dossier KYC de {username} approuvé et promu au Tier 2."
    elif request.action == "REJECT":
        user.kyc_status = "REJECTED"
        action_type = "KYC_VERIFY_REJECTED"
        msg = f"Dossier KYC de {username} rejeté."
    else:
        raise HTTPException(status_code=400, detail="Action invalide. Choisissez 'APPROVE' ou 'REJECT'.")
        
    audit_log = AdminAuditLog(
        admin_username=current_admin.username,
        action_type=action_type,
        target_username=username
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "status": "success",
        "message": msg,
        "kyc_status": user.kyc_status,
        "kyc_tier": user.kyc_tier
    }
