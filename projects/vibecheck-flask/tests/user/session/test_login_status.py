import pytest
from App.constants import BLUEPRINT_PREFIXES, USER_ENDPOINTS
from dev.test.utils import (
    BASE_URL,
    get_user_login_request,
    get_user_registration_request,
)


class TestUserLoginStatus:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        yield

    def test_user_not_signed_in(self):
        res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN_STATUS}"
        )
        assert res.json["status"] is False

    def test_after_registration(self):
        req = get_user_registration_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        login_status_res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN_STATUS}"
        )
        assert login_status_res.json["status"] is True

    def test_after_user_logout(self):
        req = get_user_registration_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        self.client.post(f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGOUT}")
        res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN_STATUS}"
        )
        assert res.json["status"] is False

    def test_after_user_login(self):
        req = get_user_registration_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        self.client.post(f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGOUT}")
        req = get_user_login_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}", json=req
        )
        res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN_STATUS}"
        )
        assert res.json["status"] is True
