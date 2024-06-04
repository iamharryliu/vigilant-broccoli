import pytest
from App.constants import BLUEPRINT_PREFIXES, USER_ENDPOINTS
from App.user.models import User
from dev.test.utils import BASE_URL, get_user_registration_request


class TestChangeEmail:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        req = get_user_registration_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        yield

    def test_change_username(self):
        new_email = "new_email@email.com"
        change_email_req = {"email": new_email}
        change_email_res = self.client.put(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.CHANGE_EMAIL}",
            json=change_email_req,
        )
        assert change_email_res.json["success"] is True
        email = User.query.get(1).email
        assert email == new_email
