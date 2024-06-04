import pytest
from App.config import APP_CONFIG
from App.constants import BLUEPRINT_PREFIXES, IMAGE_ENDPOINTS, USER_ENDPOINTS
from App.outfit.models import Outfit
from App.user.models import User
from dev.test.utils import (
    BASE_URL,
    get_outfit_json,
    get_test_images,
    get_user_registration_request,
)


class TestCreateOutfit:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        req = get_user_registration_request()
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}", json=req
        )
        picture = get_test_images()
        upload_image_res = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.IMAGES}{IMAGE_ENDPOINTS.UPLOAD_BASE_64}",
            json={"picture": picture},
        )
        self.filenames = upload_image_res.json["filenames"]
        yield

    def test_creating_outfits(self):
        json = get_outfit_json(self.filenames)
        r = self.client.post(f"{BASE_URL}/outfits/create", json=json)
        assert r.json["outfit"]["id"] is 1
        assert len(Outfit.query.all()) is 1
        assert len(r.json["outfit"]["images"]) is 1

    def test_exceed_outfit_upload_limit(self):
        json = get_outfit_json(self.filenames)
        for _ in range(APP_CONFIG.DAILY_OUTFIT_UPLOAD_LIMIT + 1):
            create_outfit_res = self.client.post(
                f"{BASE_URL}/outfits/create", json=json
            )
        assert (
            create_outfit_res.json["error"]
            == f"User cannot submit more than {APP_CONFIG.DAILY_OUTFIT_UPLOAD_LIMIT} outfits per day"
        )
