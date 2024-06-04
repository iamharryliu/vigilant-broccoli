import pytest
from App.errors.handlers import ERROR_RESPONSES
from dev.test.utils import BASE_URL


class TestUserRegistration:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        yield

    def test_404(self):
        r = self.client.get(f"{BASE_URL}/asdfasdf")
        assert r.json == ERROR_RESPONSES["404"]
