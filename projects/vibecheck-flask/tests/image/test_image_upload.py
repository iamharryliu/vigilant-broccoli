import pytest
from App.constants import BLUEPRINT_PREFIXES, IMAGE_ENDPOINTS, USER_ENDPOINTS
from dev.test.utils import BASE_URL, get_test_images, get_user_registration_request


class TestImageUpload:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        req = get_user_registration_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        yield

    def test_image_upload(self):
        picture = get_test_images()
        image_upload_res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.IMAGES}{IMAGE_ENDPOINTS.UPLOAD_BASE_64}",
            json={"picture": picture},
        )
        assert len(image_upload_res.json["filenames"]) is 1
