import pytest
from App.config import USER_CONFIG
from App.constants import BLUEPRINT_PREFIXES, USER_ENDPOINTS
from dev.test.utils import BASE_URL, get_user_registration_request


class TestUserRegistration:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        yield

    def test_username_too_long(self):
        long_username = "x" * (USER_CONFIG.MAX_USERNAME_LENGTH + 1)
        req = get_user_registration_request(username=long_username)
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        assert res.json["success"] is False

    def test_password_too_long(self):
        long_password = "a" * (USER_CONFIG.MAX_PASSWORD_LENGTH + 1)
        req = get_user_registration_request(password=long_password)
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        assert res.json["success"] is False

    def test_successful_register(self):
        req = get_user_registration_request()
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        assert res.json["success"] is True

    def test_registering_same_username(self):
        req = get_user_registration_request()
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        assert res.json["success"] is False

    def test_registering_same_email(self):
        req = get_user_registration_request()
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        req = get_user_registration_request(username="another")
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        assert res.json["success"] is False
