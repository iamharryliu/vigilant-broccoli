from App.models import User
from tests.mocks import MOCK_USER_BUILDER


REGISTER_ENDPOINT = "/api/users/register"
LOGIN_ENDPOINT = "/api/users/login"
LOGOUT_ENDPOINT = "/api/users/logout"
LOGIN_STATUS_ENDPOINT = "/api/users/get_login_status"
UPDATE_USERNAME_ENDPOINT = "/api/users/update_username"
UPDATE_EMAIL_ENDPOINT = "/api/users/update_email"
UPDATE_PASSWORD_ENDPOINT = "/api/users/update_password"


def test_update_username(client):
    INITIAL_USERNAME = "username"
    UPDATED_USERNAME = "updated_username"
    user = MOCK_USER_BUILDER.build_user(INITIAL_USERNAME)
    client.post(
        REGISTER_ENDPOINT,
        json=user.get_register_json(),
    )
    client.post(LOGIN_ENDPOINT, json=user.get_login_json())
    response = client.post(
        UPDATE_USERNAME_ENDPOINT, json={"username": UPDATED_USERNAME}
    )
    assert response.status_code == 200
    user_query = User.query.first()
    assert user_query is not None


def test_update_email(client):
    INITIAL_EMAIL = "email@email.com"
    UPDATED_EMAIL = "updated_email@email.com"
    user = MOCK_USER_BUILDER.build_user(email=INITIAL_EMAIL)
    client.post(
        REGISTER_ENDPOINT,
        json=user.get_register_json(),
    )
    client.post(LOGIN_ENDPOINT, json=user.get_login_json())
    response = client.post(UPDATE_EMAIL_ENDPOINT, json={"email": UPDATED_EMAIL})
    assert response.status_code == 200
    user_query = User.query.one()
    assert user_query is not None


def test_update_password(client):
    INITIAL_PASSWORD = "password"
    UPDATED_PASSWORD = "updated_password"
    user = MOCK_USER_BUILDER.build_user(password=INITIAL_PASSWORD)
    client.post(
        REGISTER_ENDPOINT,
        json=user.get_register_json(),
    )
    client.post(LOGIN_ENDPOINT, json=user.get_login_json())
    response = client.post(
        UPDATE_PASSWORD_ENDPOINT, json={"password": UPDATED_PASSWORD}
    )
    assert response.status_code == 200
    user_query = User.query.one()
    assert user_query.password == UPDATED_PASSWORD
