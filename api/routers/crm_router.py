from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import SupportTicket
from dependencies import get_current_user
from schemas import UserCreate # using for current_user typing if needed
from pydantic import BaseModel

router = APIRouter(prefix="/crm", tags=["CRM"])

class TicketCreate(BaseModel):
    title: str
    description: str

@router.post("/tickets")
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Créer un nouveau ticket de support."""
    
    new_ticket = SupportTicket(
        username=current_user.username,
        title=ticket.title,
        description=ticket.description,
        status="NOUVEAU"
    )
    
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    return {
        "success": True, 
        "message": "Votre demande a été envoyée avec succès. Notre équipe vous contactera sous peu.",
        "ticket_id": new_ticket.id
    }

@router.get("/tickets")
def get_tickets(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Récupérer l'historique des tickets de support de l'utilisateur."""
    
    tickets = db.query(SupportTicket).filter(SupportTicket.username == current_user.username).all()
    
    result = []
    for ticket in tickets:
        result.append({
            "id": ticket.id,
            "title": ticket.title,
            "description": ticket.description,
            "status": ticket.status,
            "created_at": ticket.created_at
        })
        
    return {"tickets": result}
