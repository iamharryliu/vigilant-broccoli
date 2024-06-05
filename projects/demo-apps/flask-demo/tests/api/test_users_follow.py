from App.models import User
from tests.mocks import MOCK_USER_BUILDER


REGISTER_ENDPOINT = "/api/users/register"
LOGIN_ENDPOINT = "/api/users/login"


def test_user_follow(client):
    user1 = MOCK_USER_BUILDER.build_user("user1")
    user2 = MOCK_USER_BUILDER.build_user("user2")
    client.post(
        REGISTER_ENDPOINT,
        json=user1.get_register_json(),
    )
    client.post(
        REGISTER_ENDPOINT,
        json=user2.get_register_json(),
    )

    client.post(LOGIN_ENDPOINT, json=user1.get_login_json())
    response = client.post("/users/follow", json={"username": user2.username})
    assert response.status_code == 200
    user1_query = User.query.filter_by(username=user1.username).first()
    user2_query = User.query.filter_by(username=user2.username).first()
    assert len(user1_query.following) == 1
    assert len(user2_query.followers) == 1


def test_user_unfollow(client):
    user1 = MOCK_USER_BUILDER.build_user("user1")
    user2 = MOCK_USER_BUILDER.build_user("user2")
    client.post(
        REGISTER_ENDPOINT,
        json=user1.get_register_json(),
    )
    client.post(
        REGISTER_ENDPOINT,
        json=user2.get_register_json(),
    )

    client.post(LOGIN_ENDPOINT, json=user1.get_login_json())
    client.post("/users/follow", json={"username": user2.username})
    response = client.post("/users/unfollow", json={"username": user2.username})
    assert response.status_code == 200
    user1_query = User.query.filter_by(username=user1.username).first()
    user2_query = User.query.filter_by(username=user2.username).first()
    assert len(user1_query.following) == 0
    assert len(user2_query.followers) == 0


def test_remove_follower(client):
    user1 = MOCK_USER_BUILDER.build_user("user1")
    user2 = MOCK_USER_BUILDER.build_user("user2")
    client.post(
        REGISTER_ENDPOINT,
        json=user1.get_register_json(),
    )
    client.post(
        REGISTER_ENDPOINT,
        json=user2.get_register_json(),
    )

    client.post(LOGIN_ENDPOINT, json=user1.get_login_json())
    client.post("/users/follow", json={"username": user2.username})
    client.post(LOGIN_ENDPOINT, json=user2.get_login_json())
    response = client.post("/users/remove_follower", json={"username": user1.username})
    assert response.status_code == 200
    user1_query = User.query.filter_by(username=user1.username).first()
    user2_query = User.query.filter_by(username=user2.username).first()
    assert len(user1_query.following) == 0
    assert len(user2_query.followers) == 0
