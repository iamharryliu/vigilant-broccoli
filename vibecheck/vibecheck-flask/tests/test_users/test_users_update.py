from App.models import User
from tests.mocks import MOCK_USER_BUILDER


def test_update_username(client):
    INITIAL_USERNAME = "username"
    UPDATED_USERNAME = "updated_username"
    user = MOCK_USER_BUILDER.build_user(INITIAL_USERNAME)
    client.post(
        "/users/register",
        json=user.get_register_json(),
    )
    client.post("/users/login", json=user.get_login_json())
    response = client.post(
        "/users/update_username", json={"username": UPDATED_USERNAME}
    )
    assert response.status_code == 200
    user_query = User.query.first()
    assert user_query is not None


def test_update_email(client):
    INITIAL_EMAIL = "email@email.com"
    UPDATED_EMAIL = "updated_email@email.com"
    user = MOCK_USER_BUILDER.build_user(email=INITIAL_EMAIL)
    client.post(
        "/users/register",
        json=user.get_register_json(),
    )
    client.post("/users/login", json=user.get_login_json())
    response = client.post("/users/update_email", json={"email": UPDATED_EMAIL})
    assert response.status_code == 200
    user_query = User.query.one()
    assert user_query is not None


def test_update_password(client):
    INITIAL_PASSWORD = "password"
    UPDATED_PASSWORD = "updated_password"
    user = MOCK_USER_BUILDER.build_user(password=INITIAL_PASSWORD)
    client.post(
        "/users/register",
        json=user.get_register_json(),
    )
    client.post("/users/login", json=user.get_login_json())
    response = client.post(
        "/users/update_password", json={"password": UPDATED_PASSWORD}
    )
    assert response.status_code == 200
    user_query = User.query.one()
    assert user_query.password == UPDATED_PASSWORD
