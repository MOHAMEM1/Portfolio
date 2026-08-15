"""
Tests d'intégration pour les fonctionnalités complémentaires de XAALISI.
Couvre: Notifications, Paiements Programmés, Commissions, CRM, Statements, AML.
Utilise les fixtures du conftest.py (client, db_session).
"""
import pytest


def _register_and_login(client, username, password, pin, kyc_tier=2):
    """Helper: créer un utilisateur et récupérer les headers auth."""
    client.post("/auth/register", json={
        "username": username,
        "password": password,
        "pin_code": pin,
        "kyc_tier": kyc_tier
    })
    response = client.post("/auth/login", data={
        "username": username,
        "password": password
    })
    if response.status_code == 200:
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    return {}


def _make_admin(db_session, username):
    """Helper: promouvoir un utilisateur en ADMIN."""
    from database.models import User
    user = db_session.query(User).filter(User.username == username).first()
    if user:
        user.role = "ADMIN"
        db_session.commit()


# =============================================
# TESTS NOTIFICATIONS
# =============================================

class TestNotifications:
    def test_get_empty_notifications(self, client):
        """Un nouvel utilisateur n'a aucune notification."""
        headers = _register_and_login(client, "notif_user1", "pass1234", "1234")
        response = client.get("/notifications/", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) == 0

    def test_get_unread_count(self, client):
        """Le compteur de non-lues retourne 0 pour un nouvel utilisateur."""
        headers = _register_and_login(client, "notif_user2", "pass1234", "1234")
        response = client.get("/notifications/unread-count", headers=headers)
        assert response.status_code == 200
        assert response.json()["unread_count"] == 0

    def test_mark_all_read(self, client):
        """Marquer toutes les notifications comme lues fonctionne."""
        headers = _register_and_login(client, "notif_user3", "pass1234", "1234")
        response = client.put("/notifications/read-all", headers=headers)
        assert response.status_code == 200
        assert response.json()["status"] == "success"


# =============================================
# TESTS PAIEMENTS PROGRAMMÉS
# =============================================

class TestScheduledPayments:
    def test_create_scheduled_payment(self, client):
        """Créer un paiement programmé mensuel."""
        headers = _register_and_login(client, "sched_user1", "pass1234", "1234")
        response = client.post("/scheduled-payments/", json={
            "receiver": "beneficiary_user",
            "amount": 25000,
            "frequency": "MONTHLY",
            "description": "Pension mensuelle"
        }, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert "payment_id" in data

    def test_list_scheduled_payments(self, client):
        """Lister les paiements programmés."""
        headers = _register_and_login(client, "sched_user2", "pass1234", "1234")
        response = client.get("/scheduled-payments/", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_invalid_frequency(self, client):
        """Fréquence invalide retourne une erreur 400."""
        headers = _register_and_login(client, "sched_user3", "pass1234", "1234")
        response = client.post("/scheduled-payments/", json={
            "receiver": "someone",
            "amount": 1000,
            "frequency": "YEARLY"
        }, headers=headers)
        assert response.status_code == 400


# =============================================
# TESTS CRM (TICKETS)
# =============================================

class TestCRM:
    def test_create_ticket(self, client):
        """Créer un ticket de support."""
        headers = _register_and_login(client, "crm_user1", "pass1234", "1234")
        response = client.post("/crm/tickets", json={
            "title": "Probleme de transfert",
            "description": "Mon transfert est bloque depuis 2h"
        }, headers=headers)
        assert response.status_code == 200
        assert response.json()["success"] == True

    def test_list_user_tickets(self, client):
        """Lister les tickets de l'utilisateur."""
        headers = _register_and_login(client, "crm_user2", "pass1234", "1234")
        response = client.get("/crm/tickets", headers=headers)
        assert response.status_code == 200
        assert "tickets" in response.json()
        assert isinstance(response.json()["tickets"], list)

    def test_invalid_priority(self, client):
        """Test with missing fields returns 422."""
        headers = _register_and_login(client, "crm_user3", "pass1234", "1234")
        response = client.post("/crm/tickets", json={
            "subject": "Test"
        }, headers=headers)
        assert response.status_code == 422


# =============================================
# TESTS STATEMENTS
# =============================================

class TestStatements:
    def test_get_statement_json(self, client):
        """Récupérer un relevé au format JSON."""
        headers = _register_and_login(client, "stmt_user1", "pass1234", "1234")
        response = client.get("/statements/stmt_user1", headers=headers)
        assert response.status_code == 200


# =============================================
# TESTS FRAUD ENGINE / AML
# =============================================

class TestAML:
    def test_aml_module_exists(self):
        """Le module AML existe et est importable."""
        from fraud_engine import check_aml_rules
        assert callable(check_aml_rules)

    def test_aml_thresholds_defined(self):
        """Les seuils AML sont correctement définis."""
        from fraud_engine import AML_HIGH_AMOUNT_THRESHOLD, AML_DAILY_CUMULATIVE_LIMIT
        assert AML_HIGH_AMOUNT_THRESHOLD == 500000
        assert AML_DAILY_CUMULATIVE_LIMIT == 2000000

    def test_velocity_check_exists(self):
        """La fonction velocity check existe."""
        from fraud_engine import check_transaction_velocity
        assert callable(check_transaction_velocity)


# =============================================
# TESTS ADMIN DASHBOARD (nécessite rôle ADMIN)
# =============================================

class TestAdminDashboard:
    def test_overview_requires_admin(self, client):
        """L'endpoint overview nécessite le rôle ADMIN."""
        headers = _register_and_login(client, "normal_user1", "pass1234", "1234")
        response = client.get("/admin/stats/overview", headers=headers)
        # Devrait échouer car l'utilisateur n'est pas admin
        assert response.status_code in [401, 403]

    def test_overview_works_for_admin(self, client, db_session):
        """L'endpoint overview fonctionne pour un admin."""
        # Register user first
        client.post("/auth/register", json={
            "username": "mgr_dash1",
            "password": "pass1234",
            "pin_code": "1234",
            "kyc_tier": 3
        })
        # Promote to ADMIN *before* login so JWT token contains role=ADMIN
        _make_admin(db_session, "mgr_dash1")
        # Now login (token will have role=ADMIN)
        response = client.post("/auth/login", data={
            "username": "mgr_dash1",
            "password": "pass1234"
        })
        assert response.status_code == 200
        headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
        response = client.get("/admin/stats/overview", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_volume_fcfa" in data
