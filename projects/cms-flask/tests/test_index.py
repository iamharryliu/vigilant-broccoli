from App.const import HTTP_STATUS_CODE


def test_index(client):
    response = client.get("/")
    assert response.status_code == HTTP_STATUS_CODE.OKAY
