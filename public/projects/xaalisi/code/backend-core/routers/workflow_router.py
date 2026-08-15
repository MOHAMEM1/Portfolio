from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from dependencies import get_current_user, get_transaction_service
from database.models import User, ApprovalRequest
from schemas import ApprovalCreateRequest, ApprovalProcessRequest, ApprovalResponse
from transactions import TransactionService

router = APIRouter()

@router.post("/", response_model=ApprovalResponse)
def create_approval_request(req: ApprovalCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Initie une demande de validation (Workflow d'approbation).
    Utile pour les comptes d'entreprises où un employé initie et le manager valide.
    """
    approver = db.query(User).filter(User.username == req.approver).first()
    if not approver:
        raise HTTPException(status_code=404, detail="Valideur non trouvé.")
        
    new_req = ApprovalRequest(
        initiator=current_user.username,
        approver=req.approver,
        action_type=req.action_type,
        payload=req.payload
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req

@router.get("/pending", response_model=list[ApprovalResponse])
def get_pending_approvals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Récupère toutes les demandes en attente de validation par l'utilisateur courant.
    """
    return db.query(ApprovalRequest).filter(
        ApprovalRequest.approver == current_user.username,
        ApprovalRequest.status == "PENDING"
    ).all()

@router.post("/{request_id}/process")
def process_approval(request_id: int, req: ApprovalProcessRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db), tx_service: TransactionService = Depends(get_transaction_service)):
    """
    Approuve ou rejette une demande.
    """
    import json
    
    approval = db.query(ApprovalRequest).filter(
        ApprovalRequest.id == request_id,
        ApprovalRequest.approver == current_user.username
    ).first()
    
    if not approval:
        raise HTTPException(status_code=404, detail="Demande introuvable ou vous n'êtes pas autorisé.")
        
    if approval.status != "PENDING":
        raise HTTPException(status_code=400, detail="Cette demande a déjà été traitée.")
        
    if req.action == "APPROVE":
        approval.status = "APPROVED"
        
        # Exécution automatique de l'action
        if approval.action_type == "TRANSFER_FUNDS":
            try:
                payload = json.loads(approval.payload)
                sender = payload.get("sender")
                receiver = payload.get("receiver")
                amount = float(payload.get("amount", 0))
                
                success = tx_service.process_transfer(
                    sender=sender,
                    receiver=receiver,
                    amount=amount,
                    description=f"Approbation {request_id}"
                )
                if not success:
                    approval.status = "FAILED"
            except Exception:
                approval.status = "FAILED"
                
    elif req.action == "REJECT":
        approval.status = "REJECTED"
    else:
        raise HTTPException(status_code=400, detail="Action invalide. Utilisez APPROVE ou REJECT.")
        
    db.commit()
    return {"message": f"Demande {approval.status}.", "request_id": request_id}
