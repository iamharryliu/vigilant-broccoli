from App.models import User


def test_register_400(client):
    response = client.post(
        "/users/register", json={"email": "test@test.com", "password": "password"}
    )
    assert response.status_code == 400
    assert len(User.query.all()) == 0


def test_register_200(client):
    response = client.post(
        "/users/register",
        json={
            "username": "username",
            "email": "email@test.com",
            "password": "password",
        },
    )
    assert response.status_code == 200
    assert len(User.query.all()) == 1


def test_register_non_unique_username(client):
    response = client.post(
        "/users/register",
        json={
            "username": "username",
            "email": "email@test.com",
            "password": "password",
        },
    )
    assert response.status_code == 200
    response = client.post(
        "/users/register",
        json={
            "username": "username",
            "email": "anotheremail@test.com",
            "password": "password",
        },
    )
    assert response.status_code == 500
    assert len(User.query.all()) == 1


def test_register_non_unique_email(client):
    response = client.post(
        "/users/register",
        json={
            "username": "username",
            "email": "email@test.com",
            "password": "password",
        },
    )
    assert response.status_code == 200
    response = client.post(
        "/users/register",
        json={
            "username": "anotherusername",
            "email": "email@test.com",
            "password": "password",
        },
    )
    assert response.status_code == 500
    assert len(User.query.all()) == 1
