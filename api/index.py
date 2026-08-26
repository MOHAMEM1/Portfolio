from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from routers import auth_router, transactions_router, admin_router, ws_router, webhooks_router, entreprise_router, tontine_router, ussd_router, wallet_router, sms_router, banking_router, merchant_router, workflow_router, open_banking_router, integrations_router, beneficiaries_router, cards_router, statements_router, crm_router, admin_dashboard_router, scheduled_payments_router, commission_engine_router, api_analytics_router, notifications_router, kyc_router, cheques_router, ai_bot_router, cbs_integration_router, kyc_ocr_router, regulatory_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from config import settings

import os
# Exécution automatique des migrations (Alembic) en production
# os.system("alembic upgrade head")

from database.database import engine
from database.models import Base
# Création automatique des tables de la base de données si elles n'existent pas
Base.metadata.create_all(bind=engine)

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter

if settings.ENVIRONMENT == "production":
    app = FastAPI(title="XAALISI API", docs_url=None, redoc_url=None)
else:
    app = FastAPI(title="XAALISI API", description="Backend principal de XAALISI Mobile Money (Architecture Propre)")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Middleware de journalisation des requêtes API pour les statistiques
from middleware.api_logger import ApiLoggerMiddleware
app.add_middleware(ApiLoggerMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

from prometheus_fastapi_instrumentator import Instrumentator
Instrumentator().instrument(app).expose(app)

app.include_router(auth_router.router, prefix="/api")
app.include_router(transactions_router.router, prefix="/api")
app.include_router(admin_router.router, prefix="/api")
app.include_router(ws_router.router, prefix="/api")
app.include_router(webhooks_router.router, prefix="/api")
app.include_router(entreprise_router.router, prefix="/api")
app.include_router(tontine_router.router, prefix="/api")
app.include_router(ussd_router.router, prefix="/api")
app.include_router(wallet_router.router, prefix="/api")
app.include_router(sms_router.router, prefix="/api/sms", tags=["SMS Banking"])
app.include_router(banking_router.router, prefix="/api/digital-banking", tags=["Digital Banking"])
app.include_router(merchant_router.router, prefix="/api/merchants", tags=["SoftPOS & Merchants"])
app.include_router(workflow_router.router, prefix="/api/workflows", tags=["Approvals & Workflows"])
app.include_router(open_banking_router.router, prefix="/api/open-banking", tags=["Open Banking B2B"])
app.include_router(integrations_router.router, prefix="/api/integrations", tags=["Intégrations Tierces"])
app.include_router(beneficiaries_router.router, prefix="/api")
app.include_router(cards_router.router, prefix="/api")
app.include_router(statements_router.router, prefix="/api")
app.include_router(crm_router.router, prefix="/api")
app.include_router(admin_dashboard_router.router, prefix="/api")
app.include_router(scheduled_payments_router.router, prefix="/api")
app.include_router(commission_engine_router.router, prefix="/api/engine", tags=["Commission Engine"])
app.include_router(api_analytics_router.router, prefix="/api")
app.include_router(notifications_router.router, prefix="/api")
app.include_router(kyc_router.router, prefix="/api")
app.include_router(kyc_ocr_router.router, prefix="/api/ged", tags=["GED, OCR & Signature"])
app.include_router(regulatory_router.router, prefix="/api/regulatory", tags=["Conformité & Reporting"])
app.include_router(cheques_router.router, prefix="/api/cheques", tags=["Chèques"])
app.include_router(ai_bot_router.router, prefix="/api/ai", tags=["Assistant IA"])
app.include_router(cbs_integration_router.router, prefix="/api/cbs", tags=["CBS & ISO 20022"])

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur le serveur API de XAALISI."}

@app.get("/health")
def health_check():
    return {"status": "ok"}