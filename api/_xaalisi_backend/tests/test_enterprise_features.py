import pytest
import io
import os
import hmac
import hashlib
import math
from database.models import User, Transaction, RoleEnum
from config import settings
from transactions import TransactionService

def register_user(client, db_session, username, role="USER"):
    # Supprimer l'utilisateur s'il existe déjà
    existing = db_session.query(User).filter(User.username == username).first()
    if existing:
        db_session.delete(existing)
        db_session.commit()

    client.post(
        "/auth/register",
        json={"username": username, "password": "password123", "pin_code": "1234"}
    )
    user = db_session.query(User).filter(User.username == username).first()
    user.role = role
    db_session.commit()
    
    res = client.post(
        "/auth/login",
        data={"username": username, "password": "password123"}
    )
    return res.json()["access_token"]

def login_user(client, username):
    res = client.post(
        "/auth/login",
        data={"username": username, "password": "password123"}
    )
    return res.json()["access_token"]

def test_currency_abstraction(client, db_session):
    # 1. Enregistrer un utilisateur
    token = register_user(client, db_session, "mali_user", "USER")
    
    # 2. Consulter le solde et vérifier que la devise renvoyée correspond à la configuration
    res = client.get(
        "/transactions/balance/mali_user",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert res.json()["currency"] == settings.DEFAULT_CURRENCY
    assert settings.DEFAULT_CURRENCY == "FCFA"

def test_kyc_progressive_workflow(client, db_session):
    # 1. Enregistrer le client et l'admin
    token_client = register_user(client, db_session, "client_kyc", "USER")
    token_admin = register_user(client, db_session, "mgr_kyc", "ADMIN")
    
    # 2. Vérifier le statut initial du KYC
    res_status = client.get(
        "/auth/kyc/status",
        headers={"Authorization": f"Bearer {token_client}"}
    )
    assert res_status.status_code == 200
    assert res_status.json()["kyc_status"] == "NONE"
    assert res_status.json()["kyc_tier"] == 1
    
    # 3. Télécharger un document d'identité fictif
    file_content = b"fake ID card content"
    file_obj = io.BytesIO(file_content)
    res_upload = client.post(
        "/auth/kyc/upload",
        files={"file": ("my_id.jpg", file_obj, "image/jpeg")},
        headers={"Authorization": f"Bearer {token_client}"}
    )
    assert res_upload.status_code == 200
    assert res_upload.json()["kyc_status"] == "PENDING"
    
    # Vérifier que le statut est mis à jour
    res_status2 = client.get(
        "/auth/kyc/status",
        headers={"Authorization": f"Bearer {token_client}"}
    )
    assert res_status2.json()["kyc_status"] == "PENDING"
    
    # 4. Admin récupère les demandes en attente
    res_pending = client.get(
        "/admin/kyc/pending",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert res_pending.status_code == 200
    usernames = [u["username"] for u in res_pending.json()]
    assert "client_kyc" in usernames
    
    # 5. Admin valide la demande KYC
    res_verify = client.post(
        "/admin/kyc/verify/client_kyc",
        json={"action": "APPROVE"},
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert res_verify.status_code == 200
    assert res_verify.json()["kyc_status"] == "APPROVED"
    assert res_verify.json()["kyc_tier"] == 2
    
    # 6. Vérifier que les limites et l'accès final du client sont à jour
    res_status3 = client.get(
        "/auth/kyc/status",
        headers={"Authorization": f"Bearer {token_client}"}
    )
    assert res_status3.json()["kyc_status"] == "APPROVED"
    assert res_status3.json()["kyc_tier"] == 2

def test_signed_receipt_generation(client, db_session):
    # 1. Créer les parties prenantes et l'admin
    token_sender = register_user(client, db_session, "sender_receipt", "USER")
    token_receiver = register_user(client, db_session, "receiver_receipt", "USER")
    token_imposter = register_user(client, db_session, "imposter_receipt", "USER")
    token_admin = register_user(client, db_session, "mgr_receipt", "ADMIN")
    
    # 2. Approvisionner l'expéditeur
    tx_service = TransactionService(db_session)
    tx_service.process_deposit(agent_id="System_Bank", agent_role="ADMIN", account_id="sender_receipt", amount=10000.0)
    
    # 3. Effectuer un transfert
    res_tx = client.post(
        "/transactions/transfer",
        json={"sender": "sender_receipt", "receiver": "receiver_receipt", "amount": 2000.0, "pin_code": "1234"},
        headers={"Authorization": f"Bearer {token_sender}"}
    )
    assert res_tx.status_code == 200
    
    # Récupérer l'ID de la transaction créée
    tx = db_session.query(Transaction).filter(
        Transaction.description == "Transfert P2P"
    ).first()
    assert tx is not None
    tx_id = tx.id
    
    # 4. Expéditeur demande le reçu
    res_receipt = client.get(
        f"/transactions/receipt/{tx_id}",
        headers={"Authorization": f"Bearer {token_sender}"}
    )
    assert res_receipt.status_code == 200
    data = res_receipt.json()
    assert data["transaction_id"] == tx_id
    assert data["amount"] == 2000.0
    assert data["sender"] == "sender_receipt"
    assert data["receiver"] == "receiver_receipt"
    
    # Vérifier l'authenticité de la signature
    timestamp_str = tx.timestamp.isoformat()
    message = f"{tx_id}|{timestamp_str}|2000.0|{settings.DEFAULT_CURRENCY}|sender_receipt|receiver_receipt"
    expected_sig = hmac.new(
        settings.SECRET_KEY.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    assert data["signature_hash"] == expected_sig
    
    # 5. Destinataire demande le reçu
    res_receipt_rec = client.get(
        f"/transactions/receipt/{tx_id}",
        headers={"Authorization": f"Bearer {token_receiver}"}
    )
    assert res_receipt_rec.status_code == 200
    
    # 6. Admin demande le reçu
    res_receipt_adm = client.get(
        f"/transactions/receipt/{tx_id}",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert res_receipt_adm.status_code == 200
    
    # 7. Un intrus tente d'accéder au reçu -> 403 Interdit
    res_receipt_bad = client.get(
        f"/transactions/receipt/{tx_id}",
        headers={"Authorization": f"Bearer {token_imposter}"}
    )
    assert res_receipt_bad.status_code == 403

def test_agent_geolocation_and_scoring(client, db_session):
    # 1. Enregistrer un client et deux agents
    token_client = register_user(client, db_session, "client_geo", "USER")
    register_user(client, db_session, "agent_mopti", "AGENT")
    register_user(client, db_session, "agent_bamako", "AGENT")
    
    # Configurer les coordonnées géographiques des agents
    # Agent 1 : Proche (ex. lat=12.6, lon=-8.0)
    # Agent 2 : Loin (ex. lat=14.5, lon=-4.1)
    agent1 = db_session.query(User).filter(User.username == "agent_mopti").first()
    agent1.latitude = 12.6
    agent1.longitude = -8.0
    agent1.agent_score = 5.0
    agent1.agent_ratings_count = 1
    
    agent2 = db_session.query(User).filter(User.username == "agent_bamako").first()
    agent2.latitude = 14.5
    agent2.longitude = -4.1
    agent2.agent_score = 4.0
    agent2.agent_ratings_count = 1
    db_session.commit()
    
    # 2. Rechercher les agents à proximité (depuis lat=12.5, lon=-8.1)
    res_nearby = client.get(
        "/transactions/agents/nearby?latitude=12.5&longitude=-8.1",
        headers={"Authorization": f"Bearer {token_client}"}
    )
    assert res_nearby.status_code == 200
    data_nearby = res_nearby.json()
    assert len(data_nearby) == 2
    
    # Le plus proche doit être agent_mopti (distance d'environ 0.14)
    assert data_nearby[0]["username"] == "agent_mopti"
    assert data_nearby[1]["username"] == "agent_bamako"
    
    # 3. Noter l'agent_mopti
    res_rate = client.post(
        "/transactions/agents/agent_mopti/rate",
        json={"score": 4.0},
        headers={"Authorization": f"Bearer {token_client}"}
    )
    assert res_rate.status_code == 200
    # Nouvelle note attendue : (5.0 * 1 + 4.0) / 2 = 4.5
    assert res_rate.json()["agent_score"] == 4.5
    assert res_rate.json()["agent_ratings_count"] == 2
