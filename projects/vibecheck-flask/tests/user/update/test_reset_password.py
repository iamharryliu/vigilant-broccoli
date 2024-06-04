import pytest
from App.constants import BLUEPRINT_PREFIXES, USER_ENDPOINTS
from App.user.models import User
from dev.test.utils import (
    BASE_URL,
    DEFAULT_MOCK_USER,
    get_user_login_request,
    get_user_registration_request,
)


class TestResetPassword:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        req = get_user_registration_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        yield

    def test_reset_password_request(self):
        req = {"email": "bad@email.com"}
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.PASSWORD_RESET.REQUEST}",
            json=req,
        )
        assert res.json["success"] is False

        req = {"email": DEFAULT_MOCK_USER.EMAIL}
        res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.PASSWORD_RESET.REQUEST}",
            json=req,
        )
        assert res.json["success"] is True

    def test_check_for_valid_password_reset_token(self):
        user = User.query.get(1)
        invalid_token = "x"
        valid_token = user.get_reset_password_token()

        invalid_token_res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.PASSWORD_RESET.VALIDATE_TOKEN}/{invalid_token}"
        )
        assert invalid_token_res.json["success"] is False

        valid_token_res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.PASSWORD_RESET.VALIDATE_TOKEN}/{valid_token}"
        )
        assert valid_token_res.json["success"] is True

    def test_set_new_password(self):
        new_pw = "somethingelse"
        user = User.query.get(1)
        invalid_token = "x"
        valid_token = user.get_reset_password_token()
        set_pw_req = {"password": new_pw}

        set_pw_res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.PASSWORD_RESET.SET_PASSWORD}/{invalid_token}",
            json=set_pw_req,
        )
        assert set_pw_res.json["success"] is False

        set_pw_res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.PASSWORD_RESET.SET_PASSWORD}/{valid_token}",
            json=set_pw_req,
        )
        assert set_pw_res.json["success"] is True
        login_req = get_user_login_request(password=new_pw)
        login_res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}",
            json=login_req,
        )
        assert login_res.json["success"] is True
