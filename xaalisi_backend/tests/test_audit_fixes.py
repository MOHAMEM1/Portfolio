import pytest
from database.models import User, TontineGroup, TontineMember, TontineStatusEnum
from transactions import TransactionService

def register_user(client, db_session, username, role="USER"):
    # Clear any potential existing user
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

def test_tontine_process_cycle_access(client, db_session):
    # 1. Register users: Creator (USER), Member (USER), Admin (ADMIN)
    token_a = register_user(client, db_session, "creator_user", "USER")
    token_b = register_user(client, db_session, "other_user", "USER")
    
    # 2. Creator creates a tontine
    res = client.post(
        "/tontines/create",
        json={"name": "Tontine Test", "contribution_amount": 1000.0, "frequency": "DAILY"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res.status_code == 200
    tontine_id = res.json()["tontine_id"]
    
    # 3. UserB joins the tontine
    res = client.post(
        f"/tontines/{tontine_id}/join",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res.status_code == 200
    
    # 4. Creator starts the tontine
    res = client.post(
        f"/tontines/{tontine_id}/start",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res.status_code == 200
    
    # 5. UserB (non-creator/non-admin) tries to trigger process-cycle -> 403 Forbidden
    res = client.post(
        f"/tontines/{tontine_id}/process-cycle",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res.status_code == 403
    assert "Seul le créateur" in res.json()["detail"]
    
    # 6. Creator triggers process-cycle -> Should bypass 403 (will raise balance/pool issue if not funded, which is not 403)
    res = client.post(
        f"/tontines/{tontine_id}/process-cycle",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res.status_code != 403

def test_admin_dashboard_kpis_fees(client, db_session):
    # 1. Register users
    token_admin = register_user(client, db_session, "boss_user", "ADMIN")
    register_user(client, db_session, "sender_user", "USER")
    register_user(client, db_session, "receiver_user", "USER")
    
    # 2. Fund sender_user
    tx_service = TransactionService(db_session)
    tx_service.process_deposit(agent_id="System_Bank", agent_role="ADMIN", account_id="sender_user", amount=10000.0)
    
    # 3. Perform a transfer (amount=5000, fee=50.0 under XAALISI_FEES)
    token_sender = login_user(client, "sender_user")
    res = client.post(
        "/transactions/transfer",
        json={"sender": "sender_user", "receiver": "receiver_user", "amount": 5000.0, "pin_code": "1234"},
        headers={"Authorization": f"Bearer {token_sender}"}
    )
    assert res.status_code == 200
    
    # 4. Check KPIs dashboard
    res_kpis = client.get(
        "/admin/dashboard/kpis",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert res_kpis.status_code == 200
    kpis = res_kpis.json()["data"]
    
    # Fee should be exactly 50.0 FCFA f XAALISI_FEES
    assert kpis["total_fees_collected_fcfa"] == 50.0

def test_atomic_bulk_salaries_success(client, db_session):
    # 1. Register Enterprise and Employees
    token_ent = register_user(client, db_session, "mine_enterprise", "ENTREPRISE")
    register_user(client, db_session, "emp_one", "USER")
    register_user(client, db_session, "emp_two", "USER")
    
    # 2. Fund Enterprise
    tx_service = TransactionService(db_session)
    tx_service.process_deposit(agent_id="System_Bank", agent_role="ADMIN", account_id="mine_enterprise", amount=50000.0)
    
    # 3. Execute bulk salaries
    # Required: (10000 + 100 fee) + (20000 + 200 fee) = 30300 FCFA
    res = client.post(
        "/entreprise/bulk-salaries",
        json={
            "batch_reference": "BATCH_MAY_2026",
            "payments": [
                {"employee_username": "emp_one", "amount": 10000.0},
                {"employee_username": "emp_two", "amount": 20000.0}
            ]
        },
        headers={"Authorization": f"Bearer {token_ent}"}
    )
    assert res.status_code == 200
    assert "Batch traité avec succès" in res.json()["message"]
    
    # 4. Verify Balances
    assert tx_service.get_balance("mine_enterprise") == 50000.0 - 30300.0
    assert tx_service.get_balance("emp_one") == 10000.0
    assert tx_service.get_balance("emp_two") == 20000.0

def test_atomic_bulk_salaries_rollback(client, db_session):
    # 1. Register Enterprise and Employee
    token_ent = register_user(client, db_session, "cotton_enterprise", "ENTREPRISE")
    register_user(client, db_session, "emp_lucky", "USER")
    
    # 2. Fund Enterprise
    tx_service = TransactionService(db_session)
    tx_service.process_deposit(agent_id="System_Bank", agent_role="ADMIN", account_id="cotton_enterprise", amount=50000.0)
    
    # 3. Execute bulk salaries with a mid-loop error (paying itself as second payment triggers error)
    res = client.post(
        "/entreprise/bulk-salaries",
        json={
            "batch_reference": "BATCH_ROLLBACK_TEST",
            "payments": [
                {"employee_username": "emp_lucky", "amount": 10000.0},
                {"employee_username": "cotton_enterprise", "amount": 10000.0}  # Will fail: sender == receiver
            ]
        },
        headers={"Authorization": f"Bearer {token_ent}"}
    )
    assert res.status_code == 400
    assert "Le paiement de masse a échoué et a été entièrement annulé" in res.json()["detail"]
    
    # 4. Verify Rollback: absolutely NO changes to balances!
    assert tx_service.get_balance("cotton_enterprise") == 50000.0
    assert tx_service.get_balance("emp_lucky") == 0.0
