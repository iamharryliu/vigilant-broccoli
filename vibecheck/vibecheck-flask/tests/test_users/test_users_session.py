from flask import session
from tests.mocks import MOCK_USER_BUILDER
from App.config import HTTP_STATUS_CODES, EXCEPTION_CODES


def test_successful_login_with_username(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            "/users/register",
            json=mock_user.get_register_json(),
        )
        response = client.post("/users/login", json=mock_user.get_login_json())
        assert response.status_code == HTTP_STATUS_CODES.OKAY
        assert session["user"]["username"] == mock_user.username


def test_successful_login_with_email(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            "/users/register",
            json=mock_user.get_register_json(),
        )
        response = client.post(
            "/users/login",
            json={**mock_user.get_login_json(), "identification": mock_user.email},
        )
        assert response.status_code == HTTP_STATUS_CODES.OKAY
        assert session["user"]["username"] == mock_user.username


def test_unsuccessful_login_with_incorrect_username(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            "/users/register",
            json=mock_user.get_register_json(),
        )
        response = client.post(
            "/users/login",
            json={**mock_user.get_login_json(), "identification": "another_username"},
        )
        assert response.status_code == HTTP_STATUS_CODES.FORBIDDEN_REQUEST
        assert response.json["code"] == EXCEPTION_CODES.FORBIDDEN_REQUEST


def test_unsuccessful_login_with_incorrect_email(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            "/users/register",
            json=mock_user.get_register_json(),
        )
        response = client.post(
            "/users/login",
            json={**mock_user.get_login_json(), "identification": "another@email.com"},
        )
        assert response.status_code == HTTP_STATUS_CODES.FORBIDDEN_REQUEST
        assert response.json["code"] == EXCEPTION_CODES.FORBIDDEN_REQUEST


def test_unsuccessful_login_with_incorrect_password(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            "/users/register",
            json=mock_user.get_register_json(),
        )
        response = client.post(
            "/users/login",
            json={**mock_user.get_login_json(), "password": "another_password"},
        )
        assert response.status_code == HTTP_STATUS_CODES.FORBIDDEN_REQUEST
        assert response.json["code"] == EXCEPTION_CODES.FORBIDDEN_REQUEST


def test_logout(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            "/users/register",
            json=mock_user.get_register_json(),
        )
        client.post("/users/login", json=mock_user.get_login_json())
        assert session["user"]["username"] == mock_user.username
        response = client.post("/users/logout")
        assert response.status_code == HTTP_STATUS_CODES.OKAY
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
