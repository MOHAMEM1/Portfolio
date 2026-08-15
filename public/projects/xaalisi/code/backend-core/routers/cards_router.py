from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid
import random

from database.database import get_db
from database.models import VirtualCard, Card
from dependencies import get_current_user

router = APIRouter(prefix="/cards", tags=["Cards"])

def generate_random_card_number():
    # Mastercard format typically starts with 5
    return "5" + "".join([str(random.randint(0, 9)) for _ in range(15)])

def generate_cvv():
    return "".join([str(random.randint(0, 9)) for _ in range(3)])

@router.post("/virtual")
def generate_virtual_card(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Générer une nouvelle carte bancaire virtuelle pour l'utilisateur."""
    
    # Check if user already has 2 active virtual cards
    active_cards_count = db.query(VirtualCard).filter(
        VirtualCard.username == current_user.username,
        VirtualCard.status == "ACTIVE"
    ).count()
    
    if active_cards_count >= 2:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas avoir plus de 2 cartes virtuelles actives.")
    
    # Calculate expiry (e.g., 3 years from now)
    now = datetime.now(timezone.utc)
    expiry_year = now.year + 3
    expiry_month = now.month
    
    new_card = VirtualCard(
        username=current_user.username,
        card_number=generate_random_card_number(),
        cardholder_name=current_user.username.upper(), # Or fetch actual name if available
        expiry_month=expiry_month,
        expiry_year=expiry_year,
        cvv=generate_cvv(),
        daily_limit=500000.0,
        status="ACTIVE"
    )
    
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    
    return {
        "success": True,
        "message": "Carte virtuelle générée avec succès.",
        "card": {
            "id": new_card.id,
            "card_number": new_card.card_number,
            "expiry": f"{new_card.expiry_month:02d}/{str(new_card.expiry_year)[-2:]}",
            "cvv": new_card.cvv,
            "cardholder_name": new_card.cardholder_name,
            "status": new_card.status,
            "daily_limit": new_card.daily_limit,
            "card_type": "virtual"
        }
    }

@router.post("/physical")
def generate_physical_card(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Générer une nouvelle carte bancaire physique pour l'utilisateur."""
    
    active_cards_count = db.query(Card).filter(
        Card.username == current_user.username,
        Card.status == "ACTIVE",
        Card.card_type == "PHYSICAL"
    ).count()
    
    if active_cards_count >= 1:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas avoir plus d'une carte physique active.")
    
    now = datetime.now(timezone.utc)
    expiry_year = now.year + 3
    expiry_month = now.month
    
    new_card = Card(
        username=current_user.username,
        card_number=generate_random_card_number(),
        expiration_date=f"{expiry_month:02d}/{str(expiry_year)[-2:]}",
        cvv=generate_cvv(),
        daily_limit=500000.0,
        status="ACTIVE",
        card_type="PHYSICAL"
    )
    
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    
    return {
        "success": True,
        "message": "Carte physique générée avec succès.",
        "card": {
            "id": new_card.id,
            "card_number": new_card.card_number,
            "expiry": new_card.expiration_date,
            "cvv": new_card.cvv,
            "cardholder_name": current_user.username.upper(),
            "status": new_card.status,
            "daily_limit": new_card.daily_limit,
            "card_type": "physical"
        }
    }

@router.get("/virtual")
def get_virtual_cards(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Lister toutes les cartes virtuelles de l'utilisateur."""
    
    cards = db.query(VirtualCard).filter(VirtualCard.username == current_user.username).order_by(VirtualCard.created_at.asc()).all()
    
    if not cards:
        # Create a primary card automatically if the user has none
        now = datetime.now(timezone.utc)
        new_card = VirtualCard(
            username=current_user.username,
            card_number=generate_random_card_number(),
            cardholder_name=current_user.username.upper(),
            expiry_month=now.month,
            expiry_year=now.year + 3,
            cvv=generate_cvv(),
            daily_limit=500000.0,
            status="ACTIVE"
        )
        db.add(new_card)
        db.commit()
        db.refresh(new_card)
        cards = [new_card]
        
    result = []
    for card in cards:
        result.append({
            "id": card.id,
            "card_number": card.card_number,
            "expiry": f"{card.expiry_month:02d}/{str(card.expiry_year)[-2:]}",
            "cvv": card.cvv,
            "cardholder_name": card.cardholder_name,
            "status": card.status,
            "daily_limit": card.daily_limit,
            "card_type": "virtual"
        })
        
    physical_cards = db.query(Card).filter(Card.username == current_user.username, Card.card_type == "PHYSICAL").order_by(Card.created_at.asc()).all()
    for p_card in physical_cards:
        result.append({
            "id": p_card.id,
            "card_number": p_card.card_number,
            "expiry": p_card.expiration_date,
            "cvv": p_card.cvv,
            "cardholder_name": current_user.username.upper(),
            "status": p_card.status,
            "daily_limit": p_card.daily_limit,
            "card_type": "physical"
        })
        
    return {"cards": result}

@router.post("/{card_id}/block")
def block_card(card_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Bloquer une carte (virtuelle ou physique)."""
    
    is_physical = False
    card = db.query(VirtualCard).filter(
        VirtualCard.id == card_id,
        VirtualCard.username == current_user.username
    ).first()
    
    if not card:
        card = db.query(Card).filter(
            Card.id == card_id,
            Card.username == current_user.username
        ).first()
        is_physical = True
        
    if not card:
        raise HTTPException(status_code=404, detail="Carte introuvable.")
        
    if card.status == "BLOCKED":
        raise HTTPException(status_code=400, detail="Cette carte est déjà bloquée.")
        
    card.status = "BLOCKED"
    db.commit()
    
    return {"success": True, "message": "Carte bloquée avec succès."}

@router.post("/{card_id}/unblock")
def unblock_card(card_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Débloquer une carte (virtuelle ou physique)."""
    
    is_physical = False
    card = db.query(VirtualCard).filter(
        VirtualCard.id == card_id,
        VirtualCard.username == current_user.username
    ).first()
    
    if not card:
        card = db.query(Card).filter(
            Card.id == card_id,
            Card.username == current_user.username
        ).first()
        is_physical = True
        
    if not card:
        raise HTTPException(status_code=404, detail="Carte introuvable.")
        
    if card.status == "ACTIVE":
        raise HTTPException(status_code=400, detail="Cette carte est déjà active.")
        
    card.status = "ACTIVE"
    db.commit()
    
    return {"success": True, "message": "Carte débloquée avec succès."}

@router.delete("/{card_id}")
def delete_card(card_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Supprimer définitivement une carte (virtuelle ou physique)."""
    
    # Check Virtual cards first
    user_cards = db.query(VirtualCard).filter(VirtualCard.username == current_user.username).order_by(VirtualCard.created_at.asc()).all()
    card = next((c for c in user_cards if c.id == card_id), None)
    
    if card:
        if len(user_cards) > 0 and user_cards[0].id == card_id:
            raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre carte principale.")
    else:
        # Check Physical cards
        card = db.query(Card).filter(
            Card.id == card_id,
            Card.username == current_user.username,
            Card.card_type == "PHYSICAL"
        ).first()
        
    if not card:
        raise HTTPException(status_code=404, detail="Carte introuvable.")
        
    db.delete(card)
    db.commit()
    
    return {"success": True, "message": "Carte supprimée avec succès."}
