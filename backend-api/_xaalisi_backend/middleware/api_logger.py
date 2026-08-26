"""
Middleware de journalisation des appels API.
Enregistre chaque requête dans la table ApiLog pour le monitoring et les analytics.
"""
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from database.database import SessionLocal
from database.models import ApiLog

logger = logging.getLogger(__name__)


class ApiLoggerMiddleware(BaseHTTPMiddleware):
    """Middleware qui log automatiquement chaque requête API."""
    
    # Endpoints à ne pas logger (pour éviter la surcharge)
    EXCLUDED_PATHS = {"/", "/docs", "/openapi.json", "/redoc", "/favicon.ico"}
    
    async def dispatch(self, request: Request, call_next):
        # Ne pas logger les endpoints système
        if request.url.path in self.EXCLUDED_PATHS or request.url.path.startswith("/ws/"):
            return await call_next(request)
        
        start_time = time.time()
        
        # Exécuter la requête
        response = await call_next(request)
        
        # Calculer le temps de réponse
        response_time_ms = (time.time() - start_time) * 1000
        
        # Enregistrer le log dans la base de données (async-safe)
        try:
            db = SessionLocal()
            try:
                # Extraire le username du token JWT si disponible
                username = None
                auth_header = request.headers.get("Authorization", "")
                if auth_header.startswith("Bearer "):
                    try:
                        import jwt
                        from config import settings
                        token = auth_header.split(" ")[1]
                        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                        username = payload.get("sub")
                    except Exception:
                        pass
                
                api_log = ApiLog(
                    endpoint=request.url.path,
                    method=request.method,
                    status_code=response.status_code,
                    response_time_ms=round(response_time_ms, 2),
                    client_ip=request.client.host if request.client else None,
                    user_agent=request.headers.get("User-Agent", "")[:200],
                    username=username
                )
                db.add(api_log)
                db.commit()
            except Exception as e:
                logger.debug(f"Could not log API request: {e}")
                db.rollback()
            finally:
                db.close()
        except Exception:
            pass
        
        return response
