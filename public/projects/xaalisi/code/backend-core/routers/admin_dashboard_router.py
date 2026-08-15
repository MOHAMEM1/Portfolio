"""
Dashboard BI avancé pour l'administration.
CDC Complémentaire §14 — Business Intelligence dashboards.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timezone, timedelta

from database.database import get_db
from database.models import User, Transaction, Entry, TransactionStatusEnum, EntryTypeEnum, Ticket, TontineGroup, Card, Merchant
from auth import require_role
from ledger import LedgerManager

router = APIRouter(prefix="/admin/stats", tags=["BI & Administration"])


@router.get("/overview")
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("ADMIN"))
):
    """Vue d'ensemble des KPIs de la plateforme (Direction Générale)."""
    total_users = db.query(func.count(User.id)).filter(User.status == "ACTIVE").scalar() or 0
    total_agents = db.query(func.count(User.id)).filter(User.role == "AGENT", User.status == "ACTIVE").scalar() or 0
    total_merchants = db.query(func.count(Merchant.id)).scalar() or 0
    total_cards = db.query(func.count(Card.id)).scalar() or 0
    total_tontines = db.query(func.count(TontineGroup.id)).scalar() or 0
    
    # Volume total échangé
    total_volume = db.query(func.sum(Entry.amount)).join(Transaction).filter(
        Transaction.status == TransactionStatusEnum.SETTLED.value,
        Entry.entry_type == EntryTypeEnum.DEBIT.value
    ).scalar() or 0.0

    # Revenue XAALISI
    ledger = LedgerManager(db)
    system_revenue = ledger.get_account_balance("XAALISI_FEES")

    # Transactions aujourd'hui
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    tx_today = db.query(func.count(Transaction.id)).filter(Transaction.timestamp >= today_start).scalar() or 0

    # Tickets ouverts (CRM)
    open_tickets = db.query(func.count(Ticket.id)).filter(Ticket.status.in_(["OPEN", "IN_PROGRESS", "ESCALATED"])).scalar() or 0

    return {
        "total_users": total_users,
        "total_agents": total_agents,
        "total_merchants": total_merchants,
        "total_cards": total_cards,
        "total_tontines": total_tontines,
        "total_volume_fcfa": round(total_volume, 2),
        "system_revenue_fcfa": round(system_revenue, 2),
        "transactions_today": tx_today,
        "open_support_tickets": open_tickets,
        "currency": "FCFA"
    }


@router.get("/transactions-by-type")
def get_transactions_by_type(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("ADMIN"))
):
    """Répartition des transactions par type (Direction Commerciale)."""
    results = db.query(
        Transaction.transaction_type,
        func.count(Transaction.id).label("count")
    ).group_by(Transaction.transaction_type).all()

    return [{
        "type": r.transaction_type,
        "count": r.count
    } for r in results]


@router.get("/daily-volume")
def get_daily_volume(
    days: int = Query(7, le=90, description="Nombre de jours (max 90)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("ADMIN"))
):
    """Volume de transactions par jour sur les N derniers jours (Direction Financière)."""
    daily_data = []
    now = datetime.now(timezone.utc)

    for i in range(days - 1, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        volume = db.query(func.sum(Entry.amount)).join(Transaction).filter(
            Transaction.timestamp >= day_start,
            Transaction.timestamp < day_end,
            Transaction.status == TransactionStatusEnum.SETTLED.value,
            Entry.entry_type == EntryTypeEnum.DEBIT.value
        ).scalar() or 0.0

        tx_count = db.query(func.count(Transaction.id)).filter(
            Transaction.timestamp >= day_start,
            Transaction.timestamp < day_end
        ).scalar() or 0

        daily_data.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "volume_fcfa": round(volume, 2),
            "transaction_count": tx_count
        })

    return daily_data


@router.get("/users-by-role")
def get_users_by_role(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("ADMIN"))
):
    """Répartition des utilisateurs par rôle (Direction Risques)."""
    results = db.query(
        User.role,
        func.count(User.id).label("count")
    ).filter(User.status == "ACTIVE").group_by(User.role).all()

    return [{"role": r.role, "count": r.count} for r in results]


@router.get("/kyc-compliance")
def get_kyc_compliance(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("ADMIN"))
):
    """Statistiques de conformité KYC (Direction Conformité)."""
    total = db.query(func.count(User.id)).filter(User.status == "ACTIVE").scalar() or 0
    tier1 = db.query(func.count(User.id)).filter(User.kyc_tier == 1, User.status == "ACTIVE").scalar() or 0
    tier2 = db.query(func.count(User.id)).filter(User.kyc_tier == 2, User.status == "ACTIVE").scalar() or 0
    tier3 = db.query(func.count(User.id)).filter(User.kyc_tier == 3, User.status == "ACTIVE").scalar() or 0
    locked = db.query(func.count(User.id)).filter(User.status == "LOCKED").scalar() or 0

    return {
        "total_users": total,
        "kyc_tier_1": tier1,
        "kyc_tier_2": tier2,
        "kyc_tier_3": tier3,
        "locked_accounts": locked,
        "verification_rate_pct": round(((tier2 + tier3) / max(total, 1)) * 100, 1)
    }
