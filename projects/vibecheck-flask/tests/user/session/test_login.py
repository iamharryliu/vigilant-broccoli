import pytest
from App.constants import BLUEPRINT_PREFIXES, USER_ENDPOINTS
from dev.test.utils import (
    BASE_URL,
    DEFAULT_MOCK_USER,
    get_user_login_request,
    get_user_registration_request,
)


class TestUserLogin:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        req = get_user_registration_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        yield

    def test_login_with_invalid_credentials(self):
        req = get_user_login_request(password="faulty")
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}", json=req
        )
        assert res.json["success"] is False

    def test_successful_login_with_username(self):
        req = get_user_login_request()
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}", json=req
        )
        assert res.json["success"] is True

    def test_successful_login_with_email(self):
        req = get_user_login_request(identification=DEFAULT_MOCK_USER.EMAIL)
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}", json=req
        )
        assert res.json["success"] is True
