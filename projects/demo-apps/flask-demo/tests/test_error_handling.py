import pytest
from App.const import HTTP_STATUS_CODES


class TestErrorHandling:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client

    def test_404(self):
        r = self.client.get("/asdfasdf")
        assert r.status_code == HTTP_STATUS_CODES.NOT_FOUND_ERROR
