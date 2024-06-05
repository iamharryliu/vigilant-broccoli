from tests.mocks import MOCK_USER_BUILDER
from App.const import HTTP_STATUS_CODE, EXCEPTION_CODE

REGISTER_ENDPOINT = "/api/register"
LOGIN_ENDPOINT = "/api/login"
LOGOUT_ENDPOINT = "/api/logout"
LOGIN_STATUS_ENDPOINT = "/api/get_login_status"


def test_successful_login_with_username(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            REGISTER_ENDPOINT,
            json=mock_user.get_register_json(),
        )
        response = client.post(LOGIN_ENDPOINT, json=mock_user.get_login_json())
        assert response.status_code == HTTP_STATUS_CODE.OKAY


def test_successful_login_with_email(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            REGISTER_ENDPOINT,
            json=mock_user.get_register_json(),
        )
        response = client.post(
            LOGIN_ENDPOINT,
            json={**mock_user.get_login_json(), "identification": mock_user.email},
        )
        assert response.status_code == HTTP_STATUS_CODE.OKAY


def test_unsuccessful_login_with_incorrect_username(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            REGISTER_ENDPOINT,
            json=mock_user.get_register_json(),
        )
        response = client.post(
            LOGIN_ENDPOINT,
            json={**mock_user.get_login_json(), "identification": "another_username"},
        )
        assert response.status_code == HTTP_STATUS_CODE.FORBIDDEN_REQUEST
        assert response.json["code"] == EXCEPTION_CODE.FORBIDDEN_REQUEST


def test_unsuccessful_login_with_incorrect_email(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            REGISTER_ENDPOINT,
            json=mock_user.get_register_json(),
        )
        response = client.post(
            LOGIN_ENDPOINT,
            json={**mock_user.get_login_json(), "identification": "another@email.com"},
        )
        assert response.status_code == HTTP_STATUS_CODE.FORBIDDEN_REQUEST
        assert response.json["code"] == EXCEPTION_CODE.FORBIDDEN_REQUEST


def test_unsuccessful_login_with_incorrect_password(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            REGISTER_ENDPOINT,
            json=mock_user.get_register_json(),
        )
        response = client.post(
            LOGIN_ENDPOINT,
            json={**mock_user.get_login_json(), "password": "another_password"},
        )
        assert response.status_code == HTTP_STATUS_CODE.FORBIDDEN_REQUEST
        assert response.json["code"] == EXCEPTION_CODE.FORBIDDEN_REQUEST


def test_logout(client):
    with client:
        response = client.post(LOGOUT_ENDPOINT)
        assert response.status_code == HTTP_STATUS_CODE.OKAY


def test_get_login_status(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    with client:
        client.post(
            REGISTER_ENDPOINT,
            json=mock_user.get_register_json(),
        )
        client.post(LOGIN_ENDPOINT, json=mock_user.get_login_json())
        response = client.get(LOGIN_STATUS_ENDPOINT)
        assert response.json["status"] == True
        client.post(LOGOUT_ENDPOINT)
        response = client.get(LOGIN_STATUS_ENDPOINT)
        assert response.json["status"] == False
