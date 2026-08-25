import re
from pydantic import BaseModel, Field, field_validator, ConfigDict

class UserCreate(BaseModel):
    username: str = Field(..., description="Nom d'utilisateur (ex : Wallet_Amine)")
    password: str = Field(..., min_length=4, description="Mot de passe (minimum 4 caractères)")
    pin_code: str = Field(..., min_length=4, max_length=4, description="Code PIN (4 chiffres)")
    kyc_tier: int = Field(1, description="Niveau KYC (1 par défaut, 2 pour vérifié)")

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str):
        lowered = value.lower()
        forbidden_keywords = ["system", "admin", "root", "xaalisi", "bank"]
        if any(keyword in lowered for keyword in forbidden_keywords):
            raise ValueError("Ce nom d'utilisateur contient des mots réservés au Système.")
        if not re.match(r"^[a-zA-Z0-9_.+-]+$", value):
            raise ValueError("Le nom d'utilisateur contient des caractères invalides (autorisés: lettres, chiffres, tirets, points, plus).")
        return value

class PinUpdateRequest(BaseModel):
    current_pin: str = Field(..., description="Le code PIN actuel")
    new_pin: str = Field(..., min_length=4, max_length=6, description="Le nouveau code PIN")

class TransferRequest(BaseModel):
    sender: str = Field(..., description="Compte émetteur des fonds")
    receiver: str = Field(..., description="Compte destinataire des fonds")
    amount: float = Field(..., gt=0, description="Montant (doit être supérieur à 0)")
    pin_code: str = Field(..., description="Votre code PIN de validation")

class ExternalTransferRequest(BaseModel):
    receiver_bank_code: str = Field(..., description="Code de la banque destinataire")
    receiver_account: str = Field(..., description="Numéro de compte (IBAN ou local)")
    amount: float = Field(..., gt=0, description="Montant (doit être supérieur à 0)")
    pin_code: str = Field(..., description="Votre code PIN de validation")

class WithdrawRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Montant (doit être supérieur à 0)")
    pin_code: str = Field(..., description="Votre code PIN de validation")

class BillPaymentRequest(BaseModel):
    provider: str = Field(..., description="Nom de l'entreprise : ex. TELECOM, RADEEMA")
    bill_reference: str = Field(..., description="Référence de la facture")
    amount: float = Field(..., gt=0, description="Montant (doit être supérieur à 0)")
    pin_code: str = Field(..., description="Votre code PIN de validation")

class CashRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Montant (doit être supérieur à 0)")

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str | None = None

class RefreshRequest(BaseModel):
    refresh_token: str

class OTPRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    otp_id: str
    code: str

class AccountCreate(BaseModel):
    account_type: str = Field("COURANT", description="Type de compte (COURANT, EPARGNE, MARCHAND)")

class AccountResponse(BaseModel):
    id: str
    account_type: str
    status: str
    balance: float

class BeneficiaryCreate(BaseModel):
    beneficiary_account: str = Field(..., description="Compte du bénéficiaire")
    alias: str | None = Field(None, description="Nom court ou alias pour ce compte")

class BeneficiaryResponse(BaseModel):
    id: int
    beneficiary_account: str
    alias: str | None
    
    model_config = ConfigDict(from_attributes=True)

class MerchantEnrollRequest(BaseModel):
    business_name: str = Field(..., description="Nom du commerce")
    category: str = Field(..., description="Catégorie (ex: ALIMENTATION, RESTAURANT)")

class QRCodeRequest(BaseModel):
    amount: float = Field(..., description="Montant de la transaction")
    description: str | None = Field(None, description="Description ou référence de facture")

class QRPayRequest(BaseModel):
    merchant_username: str = Field(..., description="Le nom d'utilisateur du marchand à payer")
    amount: float = Field(..., gt=0, description="Montant de la transaction")
    qr_id: str = Field(..., description="L'identifiant unique du QR code")
    pin_code: str = Field(..., description="Votre code PIN de validation")

class PaymentLinkRequest(BaseModel):
    amount: float = Field(..., description="Montant de la transaction")
    expires_in_hours: int = Field(24, description="Durée de validité du lien")

class ApprovalCreateRequest(BaseModel):
    approver: str = Field(..., description="Utilisateur qui doit valider (ex: CEO)")
    action_type: str = Field(..., description="Type d'action (ex: TRANSFER_FUNDS)")
    payload: str = Field(..., description="Données de l'action en JSON")

class ApprovalProcessRequest(BaseModel):
    action: str = Field(..., description="APPROVE ou REJECT")

class ApprovalResponse(BaseModel):
    id: int
    initiator: str
    approver: str
    action_type: str
    payload: str
    status: str
    
    model_config = ConfigDict(from_attributes=True)

class WebhookSubscriptionRequest(BaseModel):
    event_type: str = Field(..., description="Type d'évènement (ex: TRANSACTION_RECEIVED)")
    target_url: str = Field(..., description="URL HTTP ou HTTPS à appeler")
