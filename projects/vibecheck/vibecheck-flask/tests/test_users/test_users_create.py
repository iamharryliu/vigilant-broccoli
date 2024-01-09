from App.users.models import User

from App.config import HTTP_STATUS_CODES, EXCEPTION_CODES
from tests.mocks import MOCK_USER_BUILDER


def test_successful_register(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    response = client.post("/users/register", json=mock_user.get_register_json())
    assert response.status_code == HTTP_STATUS_CODES.OKAY
    assert len(User.query.all()) == 1


def test_unsuccessful_register_insufficient_data(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    json = mock_user.get_register_json()
    del json["username"]
    response = client.post("/users/register", json=json)
    assert response.status_code == HTTP_STATUS_CODES.BAD_REQUEST
    assert response.json["code"] == EXCEPTION_CODES.INSUFFICIENT_DATA
    assert len(User.query.all()) == 0


def test_unsuccessful_register_non_unique_username(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    response = client.post(
        "/users/register",
        json=mock_user.get_register_json(),
    )
    assert response.status_code == 200
    response = client.post(
        "/users/register",
        json={**mock_user.get_register_json(), "email": "another@email.com"},
    )
    assert response.status_code == HTTP_STATUS_CODES.BAD_REQUEST
    assert response.json["code"] == EXCEPTION_CODES.EXISTING_RESOURCE
    assert len(User.query.all()) == 1


def test_unsuccessful_register_non_unique_email(client):
    mock_user = MOCK_USER_BUILDER.build_user()
    response = client.post(
        "/users/register",
        json=mock_user.get_register_json(),
    )
    response = client.post(
        "/users/register",
        json={**mock_user.get_register_json(), "username": "another_username"},
    )
    assert response.status_code == HTTP_STATUS_CODES.BAD_REQUEST
    assert response.json["code"] == EXCEPTION_CODES.EXISTING_RESOURCE
    assert len(User.query.all()) == 1


# TODO: test with Postgres
# def test_register_username_exceeding_max_characters(client):
#     response = client.post(
#         "/users/register",
#         json={
#             "username": "a" * (USER_CONFIG.MAX_USERNAME_LENGTH + 1),
#             "email": "email@test.com",
#             "password": "password",
#         },
#     )
#     assert response.status_code == 500
#     assert len(User.query.all()) == 0


# def test_register_email_exceeding_max_characters(client):
#     response = client.post(
#         "/users/register",
#         json={
#             "username": "username",
#             "email": "e" * USER_CONFIG.MAX_EMAIL_LENGTH + "@test.com",
#             "password": "password",
#         },
#     )
#     assert response.status_code == 500
#     assert len(User.query.all()) == 0


# def test_register_password_exceeding_max_characters(client):
#     response = client.post(
#         "/users/register",
#         json={
#             "username": "username",
#             "email": "email@test.com",
#             "password": "a" * (USER_CONFIG.MAX_PASSWORD_LENGTH + 1),
#         },
#     )
#     assert response.status_code == 500
#     assert len(User.query.all()) == 0
