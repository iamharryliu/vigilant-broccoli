import pytest
from App.constants import BLUEPRINT_PREFIXES, USER_ENDPOINTS
from App.user.models import User
from dev.test.utils import BASE_URL, get_user_registration_request


class TestChangeUsername:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        req = get_user_registration_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        yield

    def test_change_username(self):
        new_username = "new_username"
        change_username_req = {"username": new_username}
        change_username_res = self.client.put(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.CHANGE_USERNAME}",
            json=change_username_req,
        )
        assert change_username_res.json["success"] is True
        username = User.query.get(1).username
        assert username == new_username
