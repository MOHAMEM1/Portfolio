def register_and_get_token(client, username):
    client.post(
        "/auth/register",
        json={"username": username, "password": "password123", "pin_code": "1234"}
    )
    res = client.post(
        "/auth/login",
        data={"username": username, "password": "password123"}
    )
    return res.json()["access_token"]

def test_balance_empty(client):
    token = register_and_get_token(client, "Client_A")
    response = client.get(
        "/transactions/balance/Client_A",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["balance"] == 0.0

def test_transfer_fail_no_money(client):
    token1 = register_and_get_token(client, "Client_B1")
    register_and_get_token(client, "Client_B2")
    
    response = client.post(
        "/transactions/transfer",
        json={"sender": "Client_B1", "receiver": "Client_B2", "amount": 1000, "pin_code": "1234"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    # 400 Bad Request : Fonds insuffisants
    assert response.status_code == 400
