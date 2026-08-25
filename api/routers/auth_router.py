from fastapi import APIRouter, Depends, HTTPException, status, Request, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
import auth
from schemas import UserCreate, Token, RefreshRequest, OTPRequest, OTPVerifyRequest, PinUpdateRequest
from dependencies import get_transaction_service, get_current_user, get_db
from transactions import TransactionService
from sqlalchemy.orm import Session
from limiter import limiter
from database.models import User
import os
import shutil
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, tx_service: TransactionService = Depends(get_transaction_service), db: Session = Depends(get_db)):
    """Endpoint permettant de créer un nouveau compte client."""
    hashed_pwd = auth.get_password_hash(user.password)
    hashed_pin = auth.get_password_hash(user.pin_code)
    
    # SECURITY FIX: Force public registration to only create "USER". 
    # To create an AGENT or ADMIN, a separate protected endpoint is needed.
    forced_role = "USER"
    
    success = tx_service.ledger.create_user(
        username=user.username, 
        hashed_password=hashed_pwd,
        pin_code=hashed_pin,
        role=forced_role
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Cet identifiant existe déjà. Veuillez en choisir un autre.")
        
    # Création de la carte virtuelle principale par défaut
    import random
    from datetime import datetime, timezone
    from database.models import VirtualCard
    
    now = datetime.now(timezone.utc)
    card_number = "5" + "".join([str(random.randint(0, 9)) for _ in range(15)])
    cvv = "".join([str(random.randint(0, 9)) for _ in range(3)])
    
    new_card = VirtualCard(
        username=user.username,
        card_number=card_number,
        cardholder_name=user.username.upper(),
        expiry_month=now.month,
        expiry_year=now.year + 3,
        cvv=cvv,
        daily_limit=500000.0,
        status="ACTIVE"
    )
    db.add(new_card)
    db.commit()
    
    return {"message": "Compte créé avec succès !", "username": user.username}

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), tx_service: TransactionService = Depends(get_transaction_service)):
    user_dict = tx_service.ledger.get_user_by_username(form_data.username)
    
    if not user_dict or not auth.verify_password(form_data.password, user_dict.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiant ou mot de passe incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user_dict.username, "role": user_dict.role})
    refresh_token = auth.create_refresh_token(data={"sub": user_dict.username, "role": user_dict.role})
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

@router.post("/refresh", response_model=Token)
def refresh_token(request: RefreshRequest, tx_service: TransactionService = Depends(get_transaction_service)):
    payload = auth.verify_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token invalide ou expiré")
    
    username = payload.get("sub")
    user_dict = tx_service.ledger.get_user_by_username(username)
    if not user_dict:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        
    access_token = auth.create_access_token(data={"sub": user_dict.username, "role": user_dict.role})
    new_refresh_token = auth.create_refresh_token(data={"sub": user_dict.username, "role": user_dict.role})
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": new_refresh_token}

@router.get("/check-phone")
@limiter.limit("10/minute")
def check_phone(request: Request, phone: str, tx_service: TransactionService = Depends(get_transaction_service)):
    user_dict = tx_service.ledger.get_user_by_username(phone)
    return {"exists": user_dict is not None}

from database.models import OTPCode
import random
from datetime import datetime, timedelta, timezone
from database.database import get_db

@router.post("/send-otp")
def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    # Generate 6 digit code
    code = f"{random.randint(100000, 999999)}"
    
    # Expiry 5 minutes
    expires = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    db_otp = OTPCode(
        user_phone=request.phone,
        otp_code=code,
        expires_at=expires,
        is_used=0
    )
    db.add(db_otp)
    db.commit()
    db.refresh(db_otp)
    
    # Intégration de la passerelle SMS (Point d'intégration Orange SMS / Twilio)
    logger.info(f"SMS Envoyé à {request.phone}: Code XAALISI est {code}")
    
    return {"success": True, "message": "OTP envoyé par SMS", "otp_id": str(db_otp.id)}

@router.post("/verify-otp")
def verify_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    try:
        otp_id = int(request.otp_id)
    except ValueError:
        return {"success": False, "message": "ID OTP invalide"}
        
    db_otp = db.query(OTPCode).filter(OTPCode.id == otp_id).first()
    
    if not db_otp:
        return {"success": False, "message": "Code introuvable"}
        
    if db_otp.is_used == 1:
        return {"success": False, "message": "Ce code a déjà été utilisé"}
        
    if datetime.now(timezone.utc) > db_otp.expires_at.replace(tzinfo=timezone.utc):
        return {"success": False, "message": "Le code OTP a expiré"}
        
    if db_otp.otp_code != request.code:
        return {"success": False, "message": "Code incorrect"}
        
    # Mark as used
    db_otp.is_used = 1
    db.commit()
    
    return {"success": True, "message": "Code OTP vérifié avec succès"}

import time

@router.post("/kyc/upload")
def upload_kyc_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    tx_service: TransactionService = Depends(get_transaction_service)
):
    upload_dir = "uploads/kyc_docs"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    # Validation: accept pdf, png, jpg, jpeg
    if file_extension not in [".pdf", ".png", ".jpg", ".jpeg"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format de document non supporté. Veuillez envoyer un fichier JPG, PNG ou PDF."
        )
        
    filename = f"{current_user.username}_kyc{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement du document : {str(e)}")
        
    # Simulate automated checking system (OCR, age verification, database checks)
    time.sleep(2.0)
    
    # Verification process: extract mock data and check criteria
    # Mock data matches criteria: Age >= 18, name matches user pattern
    extracted_name = "Souleymane Diallo"
    extracted_age = 27
    dob = "15/08/1998"
    
    # Save document path and update KYC state
    current_user.kyc_doc_path = file_path
    current_user.kyc_status = "PENDING"
    tx_service.ledger.db.commit()

    return {
        "status": "success",
        "message": "Document reçu. En attente de validation par un administrateur.",
        "kyc_status": "PENDING",
        "extracted_data": {
            "name": extracted_name,
            "dob": dob,
            "age": extracted_age,
            "doc_type": file_extension.upper().replace('.', ''),
            "is_valid_age": extracted_age >= 18,
            "document_match": True
        }
    }

@router.put("/pin")
def update_pin(
    request: PinUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Met à jour le code PIN de l'utilisateur après vérification de l'ancien."""
    if not auth.verify_password(request.current_pin, current_user.pin_code):
        raise HTTPException(status_code=400, detail="Code PIN actuel incorrect")
    
    hashed_new_pin = auth.get_password_hash(request.new_pin)
    current_user.pin_code = hashed_new_pin
    db.commit()
    
    return {"message": "Code PIN mis à jour avec succès"}

@router.get("/kyc/status")
def get_kyc_status(
    current_user: User = Depends(get_current_user)
):
    return {
        "username": current_user.username,
        "kyc_tier": current_user.kyc_tier,
        "kyc_status": current_user.kyc_status,
        "kyc_doc_uploaded": current_user.kyc_doc_path is not None
    }
