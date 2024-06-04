import pytest
from App.constants import BLUEPRINT_PREFIXES, USER_ENDPOINTS
from dev.test.utils import BASE_URL, get_user_registration_request


class TestSearchUser:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        user1 = get_user_registration_request(username="aabc")
        user2 = get_user_registration_request(username="aabcd", email="aabcd")
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=user1
        )
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=user2
        )

    def test_search_for_users(self):
        user_search_res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.SEARCH_USERS}/z"
        )
        assert len(user_search_res.json["users"]) == 0
        user_search_res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.SEARCH_USERS}/aabc"
        )
        assert len(user_search_res.json["users"]) == 2
        user_search_res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.SEARCH_USERS}/aabcd"
        )
        assert len(user_search_res.json["users"]) == 1
        user_search_res = self.client.get(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.SEARCH_USERS}/aabcde"
        )
        assert len(user_search_res.json["users"]) == 0
