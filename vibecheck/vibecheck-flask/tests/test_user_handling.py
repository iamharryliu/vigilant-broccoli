from flask import session


def test_login(client):
    with client:
        client.post("/users/login")
        assert session["user"] is not None


def test_logout(client):
    with client:
        client.post("/users/login")
        assert session["user"] is not None
        client.post("/users/logout")
        assert session["user"] is None


def test_get_login_status(client):
    with client:
        client.post("/users/login")
        response = client.get("/users/get_login_status")
        assert response.json["status"] == True
        client.post("/users/logout")
        response = client.get("/users/get_login_status")
        assert response.json["status"] == False
