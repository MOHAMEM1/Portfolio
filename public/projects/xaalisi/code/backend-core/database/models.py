from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum

from .database import Base
from config import settings

class AccountTypeEnum(str, enum.Enum):
    COURANT = "COURANT"
    EPARGNE = "EPARGNE"
    MARCHAND = "MARCHAND"

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    AGENT = "AGENT"
    USER = "USER"
    ENTREPRISE = "ENTREPRISE"

class TransactionStatusEnum(str, enum.Enum):
    INITIATED = "INITIATED"
    VALIDATED = "VALIDATED"
    AUTHORIZED = "AUTHORIZED"
    CAPTURED = "CAPTURED"
    SETTLED = "SETTLED"
    FAILED = "FAILED"
    REVERSED = "REVERSED"

class TransactionTypeEnum(str, enum.Enum):
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"
    TRANSFER = "TRANSFER"
    PAYMENT = "PAYMENT"
    TONTINE_CONTRIBUTION = "TONTINE_CONTRIBUTION"
    TONTINE_PAYOUT = "TONTINE_PAYOUT"

class EntryTypeEnum(str, enum.Enum):
    CREDIT = "CREDIT"
    DEBIT = "DEBIT"

class TontineFrequencyEnum(str, enum.Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"

class TontineStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    pin_code = Column(String, nullable=True) # Hashed PIN code
    role = Column(String, default=RoleEnum.USER.value, nullable=False) # Simple representation of role
    status = Column(String, default="ACTIVE", nullable=False)
    failed_pin_attempts = Column(Integer, default=0, nullable=False)
    kyc_tier = Column(Integer, default=1, nullable=False) # 1 = Standard (max 5000), 2 = Verified
    kyc_doc_path = Column(String, nullable=True)
    kyc_status = Column(String, default="NONE", nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    agent_score = Column(Float, default=5.0, nullable=True)
    agent_ratings_count = Column(Integer, default=1, nullable=True)

class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True)
    user_phone = Column(String, index=True, nullable=False)
    otp_code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Integer, default=0, nullable=False) # 0=False, 1=True

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    currency = Column(String, default=settings.DEFAULT_CURRENCY)
    
    # New fields based on XAALISI specs
    status = Column(String, default=TransactionStatusEnum.SETTLED.value, nullable=False)
    transaction_type = Column(String, default=TransactionTypeEnum.TRANSFER.value, nullable=False)
    idempotency_key = Column(String, unique=True, index=True, nullable=True)
    external_reference = Column(String, nullable=True)
    description = Column(String, nullable=True)
    
    entries = relationship("Entry", back_populates="transaction")

class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=False)
    account_id = Column(String, index=True, nullable=False) # Can be a username or "System_Bank"
    amount = Column(Float, nullable=False)
    entry_type = Column(String, nullable=False) # CREDIT or DEBIT

    transaction = relationship("Transaction", back_populates="entries")

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_username = Column(String, index=True, nullable=False)
    action_type = Column(String, nullable=False) # e.g. "UNLOCK_USER", "PROMOTE_AGENT"
    target_username = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class TontineGroup(Base):
    __tablename__ = "tontine_groups"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    creator_id = Column(String, index=True, nullable=False)
    contribution_amount = Column(Float, nullable=False)
    frequency = Column(String, nullable=False)
    status = Column(String, default=TontineStatusEnum.PENDING.value, nullable=False)
    current_cycle = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    start_date = Column(DateTime, nullable=True)

    members = relationship("TontineMember", back_populates="group", cascade="all, delete-orphan")

class TontineMember(Base):
    __tablename__ = "tontine_members"
    id = Column(Integer, primary_key=True, index=True)
    tontine_id = Column(String, ForeignKey("tontine_groups.id"), nullable=False)
    username = Column(String, nullable=False)
    payout_order = Column(Integer, nullable=False)
    total_contributed = Column(Float, default=0.0, nullable=False)
    join_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    group = relationship("TontineGroup", back_populates="members")

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(String, primary_key=True) # e.g. "username_COURANT"
    username = Column(String, ForeignKey("users.username"), nullable=False)
    account_type = Column(String, default=AccountTypeEnum.COURANT.value, nullable=False)
    iban = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="ACTIVE", nullable=False)

class Beneficiary(Base):
    __tablename__ = "beneficiaries"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, ForeignKey("users.username"), nullable=False)
    beneficiary_account = Column(String, nullable=False)
    bank_code = Column(String, nullable=True)
    alias = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    initiator = Column(String, ForeignKey("users.username"), nullable=False)
    approver = Column(String, ForeignKey("users.username"), nullable=False)
    action_type = Column(String, nullable=False) # e.g. "TRANSFER_FUNDS"
    payload = Column(String, nullable=False) # JSON payload
    status = Column(String, default="PENDING", nullable=False) # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ApiCredential(Base):
    __tablename__ = "api_credentials"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, ForeignKey("users.username"), nullable=False)
    client_id = Column(String, unique=True, index=True, nullable=False)
    client_secret_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class WebhookSubscription(Base):
    __tablename__ = "webhook_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, ForeignKey("users.username"), nullable=False)
    event_type = Column(String, nullable=False)
    target_url = Column(String, nullable=False)
    secret_key = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Card(Base):
    __tablename__ = "cards"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, ForeignKey("users.username"), nullable=False)
    card_number = Column(String, unique=True, index=True, nullable=False)
    expiration_date = Column(String, nullable=False)
    cvv = Column(String, nullable=False)
    status = Column(String, default="ACTIVE", nullable=False) # ACTIVE, BLOCKED
    card_type = Column(String, default="VIRTUAL", nullable=False)
    daily_limit = Column(Float, default=100000.0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, index=True, nullable=False)
    subject = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, default="OPEN", nullable=False) # OPEN, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED
    priority = Column(String, default="MEDIUM", nullable=False) # LOW, MEDIUM, HIGH, URGENT
    assigned_to = Column(String, nullable=True) # Agent/Admin assigné au ticket
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    business_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    status = Column(String, default="ACTIVE", nullable=False) # ACTIVE, SUSPENDED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# ============================================================
# TABLES COMPLÉMENTAIRES — Digital Banking Enterprise
# ============================================================

class ScheduledPayment(Base):
    """Paiements programmés pour pensions, aides sociales, salaires récurrents."""
    __tablename__ = "scheduled_payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sender = Column(String, ForeignKey("users.username"), nullable=False)
    receiver = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default=settings.DEFAULT_CURRENCY)
    frequency = Column(String, nullable=False) # DAILY, WEEKLY, MONTHLY
    description = Column(String, nullable=True)
    next_execution = Column(DateTime, nullable=False)
    status = Column(String, default="ACTIVE", nullable=False) # ACTIVE, PAUSED, CANCELLED
    executions_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CommissionConfig(Base):
    """Configuration des commissions par type de transaction (split entre acteurs)."""
    __tablename__ = "commission_configs"

    id = Column(Integer, primary_key=True, index=True)
    transaction_type = Column(String, unique=True, nullable=False) # TRANSFER, PAYMENT, DEPOSIT, etc.
    xaalisi_pct = Column(Float, default=0.5, nullable=False) # % pour XAALISI
    bank_pct = Column(Float, default=0.2, nullable=False) # % pour la banque adossée
    agent_pct = Column(Float, default=0.2, nullable=False) # % pour l'agent
    operator_pct = Column(Float, default=0.1, nullable=False) # % pour l'opérateur mobile money
    is_active = Column(Integer, default=1, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ApiLog(Base):
    """Journalisation des appels API pour monitoring et analytics."""
    __tablename__ = "api_logs"

    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String, nullable=False)
    method = Column(String, nullable=False) # GET, POST, PUT, DELETE
    status_code = Column(Integer, nullable=False)
    response_time_ms = Column(Float, nullable=False)
    client_ip = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    username = Column(String, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Notification(Base):
    """Notifications persistantes pour les utilisateurs."""
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    notification_type = Column(String, default="INFO", nullable=False) # INFO, TRANSACTION, SECURITY, SYSTEM
    is_read = Column(Integer, default=0, nullable=False) # 0=False, 1=True
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ChequeBookRequest(Base):
    __tablename__ = "cheque_book_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, ForeignKey("users.username"), nullable=False)
    account_id = Column(String, nullable=False)
    status = Column(String, default="PENDING", nullable=False) # PENDING, PROCESSED, DELIVERED
    pages_count = Column(Integer, default=25, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ChequeOpposition(Base):
    __tablename__ = "cheque_oppositions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, ForeignKey("users.username"), nullable=False)
    cheque_number = Column(String, nullable=False)
    amount = Column(Float, nullable=True)
    reason = Column(String, nullable=False)
    status = Column(String, default="PENDING", nullable=False) # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class VirtualCard(Base):
    __tablename__ = "virtual_cards"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, ForeignKey("users.username"), nullable=False)
    card_number = Column(String, nullable=False, unique=True)
    cardholder_name = Column(String, nullable=False)
    expiry_month = Column(Integer, nullable=False)
    expiry_year = Column(Integer, nullable=False)
    cvv = Column(String, nullable=False)
    status = Column(String, default="ACTIVE", nullable=False) # ACTIVE, BLOCKED, EXPIRED
    daily_limit = Column(Float, default=500000.0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, ForeignKey("users.username"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, default="NOUVEAU", nullable=False) # NOUVEAU, EN_COURS, RESOLU
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
