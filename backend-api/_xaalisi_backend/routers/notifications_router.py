"""
Centre de notifications persistantes.
CDC Complémentaire §4.11 — Notifications & Communication.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.database import get_db
from database.models import Notification, User
from dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def get_notifications(
    limit: int = Query(20, le=100),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les notifications de l'utilisateur connecté."""
    username = current_user.username
    query = db.query(Notification).filter(Notification.username == username)
    
    if unread_only:
        query = query.filter(Notification.is_read == 0)
    
    notifications = query.order_by(desc(Notification.created_at)).limit(limit).all()
    
    return [{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.notification_type,
        "is_read": bool(n.is_read),
        "created_at": n.created_at.isoformat() if n.created_at else None
    } for n in notifications]


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer le nombre de notifications non lues."""
    from sqlalchemy import func
    count = db.query(func.count(Notification.id)).filter(
        Notification.username == current_user.username,
        Notification.is_read == 0
    ).scalar() or 0
    
    return {"unread_count": count}


@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marquer une notification comme lue."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.username == current_user.username
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification introuvable.")
    
    notification.is_read = 1
    db.commit()
    return {"status": "success", "message": "Notification marquée comme lue."}


@router.put("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marquer toutes les notifications comme lues."""
    db.query(Notification).filter(
        Notification.username == current_user.username,
        Notification.is_read == 0
    ).update({"is_read": 1})
    db.commit()
    return {"status": "success", "message": "Toutes les notifications ont été marquées comme lues."}
