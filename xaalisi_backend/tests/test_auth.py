def test_register_success(client):
    response = client.post(
        "/auth/register",
        json={"username": "ClientDemo", "password": "password123", "pin_code": "1234"}
    )
    assert response.status_code == 201
    assert "Compte créé avec succès !" in response.json()["message"]

def test_register_duplicate(client):
    client.post(
        "/auth/register",
        json={"username": "ClientDemo", "password": "password123", "pin_code": "1234"}
    )
    response2 = client.post(
        "/auth/register",
        json={"username": "ClientDemo", "password": "password123", "pin_code": "1234"}
    )
    assert response2.status_code == 400

def test_login_success(client):
    client.post(
        "/auth/register",
        json={"username": "ClientDemo", "password": "password123", "pin_code": "1234"}
    )
    response = client.post(
        "/auth/login",
        data={"username": "ClientDemo", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_fail(client):
    response = client.post(
        "/auth/login",
        data={"username": "FakeUser", "password": "wrong"}
    )
    assert response.status_code == 401
