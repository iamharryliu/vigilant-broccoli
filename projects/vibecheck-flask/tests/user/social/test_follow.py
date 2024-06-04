import pytest
from App.constants import BLUEPRINT_PREFIXES, USER_ENDPOINTS
from dev.test.utils import (
    BASE_URL,
    get_user_login_request,
    get_user_registration_request,
)


class TestUserFollow:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        self.username1 = "new_user1"
        self.username2 = "new_user2"
        user1_register_req = get_user_registration_request(self.username1)
        user2_register_req = get_user_registration_request(
            self.username2, email=self.username2
        )
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}",
            json=user1_register_req,
        )
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}",
            json=user2_register_req,
        )
        yield

    def test_initial_followers(self):
        res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.GET_USER}",
            query_string={"username": self.username1},
        )
        assert len(res.json["user"]["following"]) is 0
        assert len(res.json["user"]["followers"]) is 0

    def test_self_following(self):
        res = self.client.put(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.FOLLOW}",
            json={"username": self.username2},
        )
        assert res.json["success"] is False

    def test_following_another_user(self):
        res = self.client.put(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.FOLLOW}",
            json={"username": self.username1},
        )
        assert res.json["success"] is True

        get_user_res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.GET_USER}",
            query_string={"username": self.username2},
        )
        user_following = get_user_res.json["user"]["following"]
        assert len(user_following), 1
        assert user_following[0]["username"] == self.username1

        get_user_res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.GET_USER}",
            query_string={"username": self.username1},
        )
        followed_user_followers = get_user_res.json["user"]["followers"]
        assert len(followed_user_followers), 1
        assert followed_user_followers[0]["username"] == self.username2

    def test_unfollower_user(self):
        self.client.put(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.FOLLOW}",
            json={"username": self.username1},
        )
        unfollow_res = self.client.put(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.UNFOLLOW}",
            json={"username": self.username1},
        )
        assert unfollow_res.json["success"] is True

        get_user_res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.GET_USER}",
            query_string={"username": self.username2},
        )
        user_following = get_user_res.json["user"]["following"]
        assert len(user_following) is 0
        get_user_res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.GET_USER}",
            query_string={"username": self.username1},
        )
        followed_user_followers = get_user_res.json["user"]["followers"]
        assert len(followed_user_followers) is 0

    def test_remove_follower(self):
        self.client.put(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.FOLLOW}",
            json={"username": self.username1},
        )
        req = get_user_login_request(self.username1)
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}", json=req
        )
        res = self.client.put(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REMOVE_FOLLOWER}/{self.username2}"
        )
        assert res.json["success"] is True

        res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.GET_USER}",
            query_string={"username": self.username2},
        )
        user_following = res.json["user"]["following"]
        assert len(user_following) is 0

        res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.GET_USER}",
            query_string={"username": self.username1},
        )
        followed_user_followers = res.json["user"]["followers"]
        assert len(followed_user_followers) is 0
