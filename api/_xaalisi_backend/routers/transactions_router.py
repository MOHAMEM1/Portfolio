from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header
import logging
from websocket_manager import manager
from schemas import TransferRequest, CashRequest, WithdrawRequest, BillPaymentRequest, ExternalTransferRequest
from dependencies import get_current_user, get_transaction_service
from transactions import TransactionService
from database.models import User, Transaction, TransactionStatusEnum, TransactionTypeEnum, RoleEnum
import auth
from config import settings
import hmac
import hashlib
from database.database import get_db
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transactions", tags=["Transactions"])

KYC_LIMITS = {
    1: 5000,      # Tier 1 : 5000 FCFA / jour
    2: 200000,    # Tier 2 : 200 000 FCFA / jour
    3: float('inf') # Tier 3 : Illimité
}

@router.get("/balance/{account_id}")
def get_balance(
    account_id: str, 
    current_user: User = Depends(get_current_user),
    tx_service: TransactionService = Depends(get_transaction_service)
):
    if current_user.username != account_id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Accès interdit. Vous ne pouvez pas consulter un compte qui ne vous appartient pas.")
        
    balance = tx_service.get_balance(account_id)
    daily_spent = tx_service.ledger.get_daily_spending(account_id)
    return {
        "account": account_id, 
        "balance": balance, 
        "currency": settings.DEFAULT_CURRENCY,
        "daily_spent": daily_spent
    }

@router.post("/deposit")
def make_deposit(
    request: CashRequest, 
    target_account: str,
    background_tasks: BackgroundTasks,
    x_idempotency_key: str = Header(None),
    current_user: User = Depends(get_current_user),
    tx_service: TransactionService = Depends(get_transaction_service)
):
    if current_user.role not in ["ADMIN", "AGENT"]:
        raise HTTPException(status_code=403, detail="Seul un agent ou un administrateur peut effectuer un dépôt pour un client.")
        
    try:
        success = tx_service.process_deposit(
            agent_id=current_user.username,
            agent_role=current_user.role, 
            account_id=target_account, 
            amount=request.amount,
            idempotency_key=x_idempotency_key
        )
        if success:
            background_tasks.add_task(manager.send_personal_message, f"Vous avez reçu un dépôt de {request.amount} {settings.DEFAULT_CURRENCY} par l'Agent {current_user.username}.", target_account)
            return {"status": "success", "message": f"Dépôt de {request.amount} {settings.DEFAULT_CURRENCY} effectué avec succès sur le compte {target_account}."}
        else:
            raise HTTPException(status_code=400, detail="Échec du dépôt.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur HTTP 500 f /deposit: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur.")

@router.post("/withdraw")
def make_withdraw(
    request: WithdrawRequest, 
    x_idempotency_key: str = Header(None),
    current_user: User = Depends(get_current_user),
    tx_service: TransactionService = Depends(get_transaction_service)
):
    if not auth.verify_password(request.pin_code, current_user.pin_code):
        attempts = tx_service.ledger.handle_failed_pin(current_user.username)
        if attempts >= 3:
            raise HTTPException(status_code=403, detail="Compte BLOQUÉ: 3 tentatives de PIN ratées.")
        raise HTTPException(status_code=400, detail=f"Code PIN incorrect ! (Tentatives restantes : {3 - attempts})")
        
    tx_service.ledger.reset_failed_pin(current_user.username)
    
    limit_max = KYC_LIMITS.get(current_user.kyc_tier, 5000)
    daily_spent = tx_service.ledger.get_daily_spending(current_user.username)
    if daily_spent + request.amount > limit_max:
        raise HTTPException(
            status_code=403, 
            detail=f"Plafond journalier atteint (Max {limit_max} {settings.DEFAULT_CURRENCY} pour le Tier {current_user.kyc_tier}). Dépensé: {daily_spent} {settings.DEFAULT_CURRENCY}."
        )

    try:
        success = tx_service.process_withdraw(
            account_id=current_user.username, 
            amount=request.amount,
            idempotency_key=x_idempotency_key
        )
        if success:
            return {"status": "success", "message": f"Retrait de {request.amount} {settings.DEFAULT_CURRENCY} effectué avec succès depuis votre compte."}
        else:
            raise HTTPException(status_code=400, detail="Échec du retrait.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur HTTP 500 f /withdraw: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur.")

from database.models import OTPCode
from datetime import datetime, timezone

@router.post("/transfer")
def make_transfer(
    request: TransferRequest, 
    background_tasks: BackgroundTasks,
    x_idempotency_key: str = Header(None),
    x_otp_code: str = Header(None),
    current_user: User = Depends(get_current_user),
    tx_service: TransactionService = Depends(get_transaction_service),
    db: Session = Depends(get_db)
):
    if current_user.username != request.sender:
        raise HTTPException(status_code=403, detail="Accès interdit. Vous ne pouvez pas transférer des fonds depuis un compte qui ne vous appartient pas.")
        
    if not auth.verify_password(request.pin_code, current_user.pin_code):
        attempts = tx_service.ledger.handle_failed_pin(current_user.username)
        if attempts >= 3:
            raise HTTPException(status_code=403, detail="Compte BLOQUÉ: 3 tentatives de PIN ratées.")
        raise HTTPException(status_code=400, detail=f"Code PIN incorrect ! (Tentatives restantes : {3 - attempts})")
        
    tx_service.ledger.reset_failed_pin(current_user.username)
    
    limit_max = KYC_LIMITS.get(current_user.kyc_tier, 5000)
    daily_spent = tx_service.ledger.get_daily_spending(current_user.username)
    if daily_spent + request.amount > limit_max:
        raise HTTPException(
            status_code=403, 
            detail=f"Plafond journalier atteint (Max {limit_max} {settings.DEFAULT_CURRENCY} pour le Tier {current_user.kyc_tier}). Dépensé: {daily_spent} {settings.DEFAULT_CURRENCY}."
        )
        
    # MFA Enforced for high-value transactions (> 50,000 FCFA)
    if request.amount > 50000:
        if not x_otp_code:
            raise HTTPException(status_code=403, detail="MFA_REQUIRED: Les transferts > 50000 FCFA nécessitent un code OTP (Header X-OTP-Code).")
        
        db_otp = db.query(OTPCode).filter(
            OTPCode.user_phone == current_user.username,
            OTPCode.otp_code == x_otp_code,
            OTPCode.is_used == 0
        ).first()
        
        if not db_otp or datetime.now(timezone.utc) > db_otp.expires_at.replace(tzinfo=timezone.utc):
            raise HTTPException(status_code=400, detail="Code OTP invalide ou expiré.")
            
        db_otp.is_used = 1
        db.commit()
        
    try:
        success = tx_service.process_transfer(
            sender=request.sender,
            receiver=request.receiver,
            amount=request.amount,
            idempotency_key=x_idempotency_key
        )
        
        if success:
            background_tasks.add_task(manager.send_personal_message, f"Vous avez reçu un transfert de {request.amount} {settings.DEFAULT_CURRENCY} de la part de {request.sender}.", request.receiver)
            return {
                "status": "success", 
                "message": f"Transfert de {request.amount} {settings.DEFAULT_CURRENCY} effectué avec succès de {request.sender} à {request.receiver}."
            }
        else:
            raise HTTPException(status_code=400, detail="Échec du transfert. Veuillez vérifier les informations saisies.")
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur HTTP 500 f /transfer: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur.")

@router.post("/pay-bill")
def pay_bill(
    request: BillPaymentRequest, 
    x_idempotency_key: str = Header(None),
    current_user: User = Depends(get_current_user),
    tx_service: TransactionService = Depends(get_transaction_service)
):
    if not auth.verify_password(request.pin_code, current_user.pin_code):
        attempts = tx_service.ledger.handle_failed_pin(current_user.username)
        if attempts >= 3:
            raise HTTPException(status_code=403, detail="Compte BLOQUÉ: 3 tentatives de PIN ratées.")
        raise HTTPException(status_code=400, detail=f"Code PIN incorrect ! (Tentatives restantes : {3 - attempts})")
        
    tx_service.ledger.reset_failed_pin(current_user.username)
    
    limit_max = KYC_LIMITS.get(current_user.kyc_tier, 5000)
    daily_spent = tx_service.ledger.get_daily_spending(current_user.username)
    if daily_spent + request.amount > limit_max:
        raise HTTPException(
            status_code=403, 
            detail=f"Plafond journalier atteint (Max {limit_max} {settings.DEFAULT_CURRENCY} pour le Tier {current_user.kyc_tier}). Dépensé: {daily_spent} {settings.DEFAULT_CURRENCY}."
        )
            
    try:
        target_account = f"SYSTEM_BILLS_{request.provider.upper()}"
        success = tx_service.process_transfer(
            sender=current_user.username,
            receiver=target_account,
            amount=request.amount,
            idempotency_key=x_idempotency_key,
            external_reference=request.bill_reference,
            description=f"Paiement facture: {request.provider}"
        )
        if success:
            return {
                "status": "success", 
                "message": f"Facture {request.bill_reference} payée avec succès à {request.provider} pour un montant de {request.amount} {settings.DEFAULT_CURRENCY}."
            }
        else:
            raise HTTPException(status_code=400, detail="Échec du paiement de la facture.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur HTTP 500 f /pay-bill: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur.")

from fastapi import Query
from pydantic import BaseModel

class MobileMoneyTopupRequest(BaseModel):
    phone_number: str
    amount: float

@router.post("/topup-mobile-money")
def initiate_topup(
    request: MobileMoneyTopupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initie une demande de Cash-In depuis Orange Money vers le Wallet.
    """
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Montant invalide.")
        
    try:
        # 1. Créer une transaction INITIATED dans la base
        new_tx = Transaction(
            currency=settings.DEFAULT_CURRENCY,
            status=TransactionStatusEnum.INITIATED.value,
            transaction_type=TransactionTypeEnum.DEPOSIT.value,
            description=f"Topup OM vers {current_user.username}"
        )
        db.add(new_tx)
        db.commit()
        db.refresh(new_tx)
        
        # 2. Appeler l'adaptateur (Simulation)
        from providers.orange_money import OrangeMoneyAdapter
        import os
        adapter = OrangeMoneyAdapter(
            api_key=os.getenv("OM_API_KEY", "mock"), 
            secret_key=os.getenv("OM_SECRET_KEY", "mock")
        )
        response = adapter.initiate_payment(request.phone_number, request.amount, new_tx.id)
        
        # Mettre à jour l'external reference
        new_tx.external_reference = response.get("provider_reference")
        db.commit()
        
        return {
            "status": "success",
            "message": "Demande de paiement envoyée. Veuillez valider sur votre téléphone.",
            "transaction_id": new_tx.id,
            "provider_reference": response.get("provider_reference")
        }
    except Exception as e:
        logger.error(f"Erreur init topup: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur technique du serveur.")

from fastapi import Query

@router.get("/history/{account_id}")
def get_history(
    account_id: str, 
    skip: int = 0,
    limit: int = Query(100, le=200, description="Max 200 items par requete"),
    current_user: User = Depends(get_current_user),
    tx_service: TransactionService = Depends(get_transaction_service)
):
    if current_user.username != account_id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Accès interdit. Vous ne pouvez pas consulter l'historique d'un autre compte.")
        
    history_list = tx_service.get_history(account_id, skip=skip, limit=limit)
    return {
        "account": account_id,
        "page_skip": skip,
        "page_limit": limit,
        "transactions": history_list
    }

class InternationalTransferRequest(BaseModel):
    sender_name: str
    receiver_account: str
    amount_eur: float
    credit_card_token: str

@router.post("/diaspora/remittance")
def international_remittance(
    request: InternationalTransferRequest,
    background_tasks: BackgroundTasks,
    x_idempotency_key: str = Header(None),
    current_user: User = Depends(get_current_user), 
    tx_service: TransactionService = Depends(get_transaction_service)
):
    """
    Transfert international (Diaspora) vers un compte XAALISI.
    Simule un prélèvement carte bancaire (EUR) et dépose en FCFA.
    """
    # Dans la vraie vie, l'appelant serait une application ou un partenaire API (Agent/Admin)
    if current_user.role not in [RoleEnum.AGENT.value, RoleEnum.ADMIN.value, RoleEnum.ENTREPRISE.value]:
         raise HTTPException(status_code=403, detail="Non autorisé à initier un transfert international.")
         
    if request.amount_eur <= 0:
        raise HTTPException(status_code=400, detail="Montant invalide.")
         
    # Taux de change fixe (Euro -> Franc CFA)
    EXCHANGE_RATE_EUR_TO_FCFA = 655.957
    amount_fcfa = round(request.amount_eur * EXCHANGE_RATE_EUR_TO_FCFA, 2)
    
    # 1. Simuler le prélèvement Stripe/Visa
    if request.credit_card_token == "INVALID":
        raise HTTPException(status_code=400, detail="Carte bancaire refusée.")
        
    try:
        # L'argent entre depuis l'extérieur vers notre compte système
        system_account = "SYSTEM_DIASPORA_EUROPE"
        
        # 2. On transfère l'argent du système vers le client local (Double entrée)
        success = tx_service.process_transfer(
            sender=system_account,
            receiver=request.receiver_account,
            amount=amount_fcfa,
            idempotency_key=x_idempotency_key,
            description=f"Remittance Diaspora de {request.sender_name} ({request.amount_eur} EUR)",
            external_reference=f"STRIPE_{request.credit_card_token}"
        )
        
        if success:
            # 3. Notification instantanée
            background_tasks.add_task(
                manager.send_personal_message, 
                f"Vous avez reçu un transfert international de {request.sender_name}: {amount_fcfa} {settings.DEFAULT_CURRENCY}.", 
                request.receiver_account
            )
            return {
                "status": "success",
                "message": f"Transfert réussi. {amount_fcfa} {settings.DEFAULT_CURRENCY} déposés sur le compte de {request.receiver_account}.",
                "exchange_rate": EXCHANGE_RATE_EUR_TO_FCFA,
                "amount_eur": request.amount_eur
            }
        else:
            raise HTTPException(status_code=400, detail="Echec du transfert interne au Ledger.")
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur Remittance Diaspora: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne au niveau du serveur de paiement.")

@router.get("/receipt/{transaction_id}")
def get_transaction_receipt(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction introuvable.")
        
    debit_entry = next((e for e in transaction.entries if e.entry_type == "DEBIT"), None)
    sender = debit_entry.account_id if debit_entry else "System_Unknown"
    
    credit_entries = [e for e in transaction.entries if e.entry_type == "CREDIT"]
    receiver_entry = next((e for e in credit_entries if e.account_id != "XAALISI_FEES"), None)
    if not receiver_entry and credit_entries:
        receiver_entry = credit_entries[0]
    receiver = receiver_entry.account_id if receiver_entry else "System_Unknown"
    
    if current_user.role != RoleEnum.ADMIN.value and current_user.username not in [sender, receiver]:
        raise HTTPException(status_code=403, detail="Accès interdit. Vous n'êtes pas partie prenante de cette transaction.")
        
    amount = receiver_entry.amount if receiver_entry else 0.0
    fee_entry = next((e for e in credit_entries if e.account_id == "XAALISI_FEES"), None)
    fee = fee_entry.amount if fee_entry else 0.0
    
    timestamp_str = transaction.timestamp.isoformat()
    message = f"{transaction.id}|{timestamp_str}|{amount}|{transaction.currency}|{sender}|{receiver}"
    signature_hash = hmac.new(
        settings.SECRET_KEY.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return {
        "transaction_id": transaction.id,
        "timestamp": transaction.timestamp,
        "amount": amount,
        "fee": fee,
        "currency": transaction.currency,
        "sender": sender,
        "receiver": receiver,
        "external_reference": transaction.external_reference,
        "description": transaction.description,
        "status": transaction.status,
        "signature_hash": signature_hash
    }

class AgentRatingRequest(BaseModel):
    score: float

@router.get("/agents/nearby")
def get_nearby_agents(
    latitude: float,
    longitude: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import math
    agents = db.query(User).filter(
        User.role == RoleEnum.AGENT.value,
        User.latitude.isnot(None),
        User.longitude.isnot(None)
    ).all()
    
    nearby_list = []
    for agent in agents:
        distance = math.sqrt((agent.latitude - latitude) ** 2 + (agent.longitude - longitude) ** 2)
        nearby_list.append({
            "username": agent.username,
            "latitude": agent.latitude,
            "longitude": agent.longitude,
            "agent_score": agent.agent_score,
            "agent_ratings_count": agent.agent_ratings_count,
            "distance": round(distance, 6)
        })
        
    nearby_list.sort(key=lambda x: x["distance"])
    return nearby_list

@router.post("/agents/{username}/rate")
def rate_agent(
    username: str,
    request: AgentRatingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if request.score < 1.0 or request.score > 5.0:
        raise HTTPException(status_code=400, detail="La note doit être comprise entre 1.0 et 5.0.")
        
    agent = db.query(User).filter(User.username == username, User.role == RoleEnum.AGENT.value).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent introuvable.")
        
    count = (agent.agent_ratings_count or 0) + 1
    current_score = agent.agent_score or 5.0
    new_score = ((current_score * (count - 1)) + request.score) / count
    
    agent.agent_ratings_count = count
    agent.agent_score = round(new_score, 2)
    db.commit()
    
    return {
        "status": "success",
        "message": f"Agent {username} évalué avec succès ! Nouvelle note : {agent.agent_score}.",
        "agent_score": agent.agent_score,
        "agent_ratings_count": agent.agent_ratings_count
    }

@router.post("/external")
def make_external_transfer(
    request: ExternalTransferRequest, 
    x_idempotency_key: str = Header(None),
    current_user: User = Depends(get_current_user),
    tx_service: TransactionService = Depends(get_transaction_service)
):
    if not auth.verify_password(request.pin_code, current_user.pin_code):
        attempts = tx_service.ledger.handle_failed_pin(current_user.username)
        if attempts >= 3:
            raise HTTPException(status_code=403, detail="Compte BLOQUÉ: 3 tentatives de PIN ratées.")
        raise HTTPException(status_code=400, detail=f"Code PIN incorrect ! (Tentatives restantes : {3 - attempts})")
        
    tx_service.ledger.reset_failed_pin(current_user.username)
    
    limit_max = KYC_LIMITS.get(current_user.kyc_tier, 5000)
    daily_spent = tx_service.ledger.get_daily_spending(current_user.username)
    if daily_spent + request.amount > limit_max:
        raise HTTPException(
            status_code=403, 
            detail=f"Plafond journalier atteint (Max {limit_max} {settings.DEFAULT_CURRENCY} pour le Tier {current_user.kyc_tier}). Dépensé: {daily_spent} {settings.DEFAULT_CURRENCY}."
        )
            
    try:
        # Mock external bank account
        target_account = f"BANK_{request.receiver_bank_code}_{request.receiver_account}"
        success = tx_service.process_transfer(
            sender=current_user.username,
            receiver=target_account,
            amount=request.amount,
            idempotency_key=x_idempotency_key,
            description=f"Virement externe vers {request.receiver_bank_code} ({request.receiver_account})"
        )
        if success:
            return {
                "status": "success", 
                "message": f"Virement externe de {request.amount} {settings.DEFAULT_CURRENCY} initié vers {request.receiver_bank_code}."
            }
        else:
            raise HTTPException(status_code=400, detail="Échec du virement externe.")
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur HTTP 500 f /external: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur.")
