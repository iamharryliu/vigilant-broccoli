import pytest
from App.constants import BLUEPRINT_PREFIXES, USER_ENDPOINTS
from dev.test.utils import (
    BASE_URL,
    DEFAULT_MOCK_USER,
    get_user_login_request,
    get_user_registration_request,
)


class TestChangePassword:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        req = get_user_registration_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        yield

    def test_change_password(self):
        new_password = "newpassword"
        req = {
            "currentPassword": DEFAULT_MOCK_USER.PASSWORD,
            "newPassword": new_password,
        }
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.CHANGE_PASSWORD}",
            json=req,
        )
        assert res.json["success"] is True
        req = get_user_login_request()
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}",
            json=req,
        )
        assert res.json["success"] is False
        req["password"] = new_password
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}",
            json=req,
        )
        assert res.json["success"] is True
