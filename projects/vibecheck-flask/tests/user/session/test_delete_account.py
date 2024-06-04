import pytest
from App.constants import BLUEPRINT_PREFIXES, USER_ENDPOINTS
from dev.test.utils import BASE_URL, get_user_registration_request


class TestDeleteAccount:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        req = get_user_registration_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        yield

    def test_delete_account(self):
        res = self.client.delete(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.DELETE_ACCOUNT}"
        )
        assert res.json["success"] is True
        res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN_STATUS}"
        )
        assert res.json["status"] is False
