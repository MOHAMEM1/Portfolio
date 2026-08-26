from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, ConfigDict

from database.database import get_db
from database.models import Beneficiary, User
from dependencies import get_current_user

router = APIRouter(prefix="/beneficiaries", tags=["Beneficiaries"])

class BeneficiaryCreate(BaseModel):
    beneficiary_account: str
    bank_code: str = None
    alias: str = None

class BeneficiaryResponse(BaseModel):
    id: int
    beneficiary_account: str
    bank_code: str = None
    alias: str = None

    model_config = ConfigDict(from_attributes=True)

@router.get("/", response_model=List[BeneficiaryResponse])
def get_beneficiaries(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    beneficiaries = db.query(Beneficiary).filter(Beneficiary.username == current_user).all()
    return beneficiaries

@router.post("/", response_model=BeneficiaryResponse)
def add_beneficiary(beneficiary: BeneficiaryCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # Verify the current user exists
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_beneficiary = Beneficiary(
        username=current_user,
        beneficiary_account=beneficiary.beneficiary_account,
        bank_code=beneficiary.bank_code,
        alias=beneficiary.alias
    )
    db.add(new_beneficiary)
    db.commit()
    db.refresh(new_beneficiary)
    return new_beneficiary

@router.delete("/{beneficiary_id}")
def delete_beneficiary(beneficiary_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    beneficiary = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id, Beneficiary.username == current_user).first()
    if not beneficiary:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    
    db.delete(beneficiary)
    db.commit()
    return {"message": "Beneficiary deleted successfully"}
