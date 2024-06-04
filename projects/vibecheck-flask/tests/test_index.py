from App.constants import HTTP_STATUS_CODES


def test_index(client):
    response = client.get("/")
    assert response.status_code == HTTP_STATUS_CODES.OKAY
