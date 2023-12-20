from flask import session
from tests.mocks import MOCK_USER_BUILDER


def test_login(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            "/users/register",
            json=mock_user.get_register_json(),
        )
        client.post("/users/login", json=mock_user.get_login_json())
        assert session["user"]["username"] == mock_user.username


def test_logout(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            "/users/register",
            json=mock_user.get_register_json(),
        )
        client.post("/users/login", json=mock_user.get_login_json())
        assert session["user"]["username"] == mock_user.username
        client.post("/users/logout")
        assert session["user"] is None


def test_get_login_status(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            "/users/register",
            json=mock_user.get_register_json(),
        )
        client.post("/users/login", json=mock_user.get_login_json())
        response = client.get("/users/get_login_status")
        assert response.json["status"] == True
        client.post("/users/logout")
        response = client.get("/users/get_login_status")
        assert response.json["status"] == False
