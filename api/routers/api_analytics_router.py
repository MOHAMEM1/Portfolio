"""
API Analytics & Monitoring.
CDC Complémentaire §6 — Monitoring des APIs et analytics.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timezone, timedelta

from database.database import get_db
from database.models import ApiLog
from auth import require_role

router = APIRouter(prefix="/api-analytics", tags=["API Analytics & Monitoring"])


@router.get("/summary")
def get_api_summary(
    hours: int = Query(24, description="Période en heures (défaut: 24h)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("ADMIN"))
):
    """Résumé des appels API sur une période donnée (Admin uniquement)."""
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    
    total_requests = db.query(func.count(ApiLog.id)).filter(
        ApiLog.timestamp >= since
    ).scalar() or 0
    
    avg_response_time = db.query(func.avg(ApiLog.response_time_ms)).filter(
        ApiLog.timestamp >= since
    ).scalar() or 0.0
    
    error_count = db.query(func.count(ApiLog.id)).filter(
        ApiLog.timestamp >= since,
        ApiLog.status_code >= 400
    ).scalar() or 0
    
    success_count = db.query(func.count(ApiLog.id)).filter(
        ApiLog.timestamp >= since,
        ApiLog.status_code < 400
    ).scalar() or 0
    
    # Top 10 endpoints les plus appelés
    top_endpoints = db.query(
        ApiLog.endpoint,
        ApiLog.method,
        func.count(ApiLog.id).label("count"),
        func.avg(ApiLog.response_time_ms).label("avg_time")
    ).filter(
        ApiLog.timestamp >= since
    ).group_by(ApiLog.endpoint, ApiLog.method).order_by(
        desc("count")
    ).limit(10).all()
    
    return {
        "period_hours": hours,
        "total_requests": total_requests,
        "success_count": success_count,
        "error_count": error_count,
        "error_rate_pct": round((error_count / max(total_requests, 1)) * 100, 2),
        "avg_response_time_ms": round(avg_response_time, 2),
        "top_endpoints": [{
            "endpoint": ep.endpoint,
            "method": ep.method,
            "call_count": ep.count,
            "avg_response_ms": round(ep.avg_time, 2) if ep.avg_time else 0
        } for ep in top_endpoints]
    }


@router.get("/logs")
def get_api_logs(
    limit: int = Query(50, le=200),
    status_filter: int | None = Query(None, description="Filtrer par code HTTP (ex: 500)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("ADMIN"))
):
    """Consulter les logs d'API détaillés (Admin uniquement)."""
    query = db.query(ApiLog).order_by(ApiLog.timestamp.desc())
    
    if status_filter:
        query = query.filter(ApiLog.status_code == status_filter)
    
    logs = query.limit(limit).all()
    
    return [{
        "id": log.id,
        "endpoint": log.endpoint,
        "method": log.method,
        "status_code": log.status_code,
        "response_time_ms": round(log.response_time_ms, 2),
        "client_ip": log.client_ip,
        "username": log.username,
        "timestamp": log.timestamp.isoformat() if log.timestamp else None
    } for log in logs]


@router.get("/health")
def get_system_health(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("ADMIN"))
):
    """Vérification de santé du système (Admin uniquement)."""
    last_hour = datetime.now(timezone.utc) - timedelta(hours=1)
    
    recent_errors = db.query(func.count(ApiLog.id)).filter(
        ApiLog.timestamp >= last_hour,
        ApiLog.status_code >= 500
    ).scalar() or 0
    
    avg_latency = db.query(func.avg(ApiLog.response_time_ms)).filter(
        ApiLog.timestamp >= last_hour
    ).scalar() or 0.0
    
    # Déterminer le statut global du système
    if recent_errors > 50:
        health_status = "CRITICAL"
    elif recent_errors > 10 or avg_latency > 2000:
        health_status = "DEGRADED"
    else:
        health_status = "HEALTHY"
    
    return {
        "status": health_status,
        "server_errors_last_hour": recent_errors,
        "avg_latency_ms": round(avg_latency, 2),
        "uptime_target": "99.5%",
        "checked_at": datetime.now(timezone.utc).isoformat()
    }
