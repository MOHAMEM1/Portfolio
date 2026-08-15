from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User, ChequeBookRequest, ChequeOpposition
from dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ChequeRequestModel(BaseModel):
    account_id: str
    pages_count: int = 25

class OppositionRequestModel(BaseModel):
    cheque_number: str
    amount: Optional[float] = None
    reason: str

@router.get("/requests")
def get_cheque_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    requests = db.query(ChequeBookRequest).filter(ChequeBookRequest.username == current_user.username).all()
    return requests

@router.post("/request")
def request_cheque_book(req: ChequeRequestModel, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.pages_count not in [25, 50, 100]:
        raise HTTPException(status_code=400, detail="Nombre de pages invalide (25, 50, 100 uniquement)")

    new_request = ChequeBookRequest(
        username=current_user.username,
        account_id=req.account_id,
        pages_count=req.pages_count,
        status="PENDING"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return {"message": "Demande de chéquier envoyée avec succès", "request_id": new_request.id}

@router.get("/oppositions")
def get_oppositions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    oppositions = db.query(ChequeOpposition).filter(ChequeOpposition.username == current_user.username).all()
    return oppositions

@router.post("/opposition")
def request_opposition(req: OppositionRequestModel, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_opposition = ChequeOpposition(
        username=current_user.username,
        cheque_number=req.cheque_number,
        amount=req.amount,
        reason=req.reason,
        status="PENDING"
    )
    db.add(new_opposition)
    db.commit()
    db.refresh(new_opposition)
    return {"message": "Opposition enregistrée avec succès", "opposition_id": new_opposition.id}
