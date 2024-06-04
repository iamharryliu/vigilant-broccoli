import pytest
from App.constants import BLUEPRINT_PREFIXES, IMAGE_ENDPOINTS, USER_ENDPOINTS
from App.user.models import User
from dev.test.utils import (
    BASE_URL,
    get_outfit_json,
    get_test_images,
    get_user_registration_request,
)


class TestOutfitLike:
    @pytest.fixture(autouse=True)
    def setup_client(self, client):
        self.client = client
        self.username1 = "new_user1"
        self.username2 = "new_user2"
        user1_register_req = get_user_registration_request(self.username1)
        user2_register_req = get_user_registration_request(
            self.username2, email=self.username2
        )
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}",
            json=user1_register_req,
        )
        self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.REGISTER}",
            json=user2_register_req,
        )
        yield

    def test_adding_outfits_to_wardrobe(self):
        picture = get_test_images()
        r = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.IMAGES}{IMAGE_ENDPOINTS.UPLOAD_BASE_64}",
            json={"picture": picture},
        )
        filenames = r.json["filenames"]
        json = get_outfit_json(filenames)
        r = self.client.post(f"{BASE_URL}/outfits/create", json=json)

        json = {"identification": self.username2, "password": "password"}
        r = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}", json=json
        )

        # Add outfit to wardrobe.
        json = {"id": 1}
        r = self.client.put(f"{BASE_URL}/outfits/like", json=json)
        assert (
            len(User.query.filter_by(username=self.username2).first().outfits_liked)
            is 1
        )

        # Add outfit to wardrobe again.
        r = self.client.put(f"{BASE_URL}/outfits/like", json=json)
        assert (
            len(User.query.filter_by(username=self.username2).first().outfits_liked)
            is 1
        )

    def test_removing_outfits_from_wardrobe(self):
        picture = get_test_images()
        r = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.IMAGES}{IMAGE_ENDPOINTS.UPLOAD_BASE_64}",
            json={"picture": picture},
        )
        filenames = r.json["filenames"]
        json = get_outfit_json(filenames)
        r = self.client.post(f"{BASE_URL}/outfits/create", json=json)
        json = {"identification": self.username2, "password": "password"}
        r = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}", json=json
        )

        # Add outfit to wardrobe.
        json = {"id": 1}
        r = self.client.put(f"{BASE_URL}/outfits/like", json=json)
        assert (
            len(User.query.filter_by(username=self.username2).first().outfits_liked)
            is 1
        )

        # Remove outfit from wardrobe.
        json = {"ids": [1]}
        r = self.client.put(f"{BASE_URL}/outfits/unlike", json=json)
        assert (
            len(User.query.filter_by(username=self.username2).first().outfits_liked)
            is 0
        )

    def test_outfit_filter(self):
        picture = get_test_images()
        r = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.IMAGES}{IMAGE_ENDPOINTS.UPLOAD_BASE_64}",
            json={"picture": picture},
        )
        filenames = r.json["filenames"]
        json = get_outfit_json(filenames)
        json["season"] = "fall"
        r = self.client.post(f"{BASE_URL}/outfits/create", json=json)

        r = self.client.get(f"{BASE_URL}/outfits/getSwipableOutfits")
        assert len(r.json["outfits"]) is 0
        json = {"identification": self.username1, "password": "password"}
        r = self.client.post(
            f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}", json=json
        )
        r = self.client.get(f"{BASE_URL}/outfits/getSwipableOutfits")
        assert len(r.json["outfits"]) is 1

        # filter by season
        r = self.client.get(f"{BASE_URL}/outfits/getSwipableOutfits?season=winter")
        assert len(r.json["outfits"]) is 0
        r = self.client.get(f"{BASE_URL}/outfits/getSwipableOutfits?season=fall")
        assert len(r.json["outfits"]) is 1

        #     # filter by sex
        r = self.client.get(f"{BASE_URL}/outfits/getSwipableOutfits?gender=masculine")
        assert len(r.json["outfits"]) is 0
        r = self.client.get(f"{BASE_URL}/outfits/getSwipableOutfits?gender=unisex")
        assert len(r.json["outfits"]) is 1

        #     # filter by multiple parameters
        r = self.client.get(
            f"{BASE_URL}/outfits/getSwipableOutfits?for_card=True&&season=fall&&gender=unisex"
        )
        assert len(r.json["outfits"]) is 1

        # check outfit followers
        # json = {"identification": self.username2, "password": "password"}
        # r = self.client.post(
        #     f"{BASE_URL}{BLUEPRINT_PREFIXES.USER}{USER_ENDPOINTS.LOGIN}", json=json
        # )
        r = self.client.get(f"{BASE_URL}/outfits/getSwipableOutfits")
        assert len(r.json["outfits"]) is 1

        # #     # add_to_wardrobe
        json = {"id": 1}
        r = self.client.put(f"{BASE_URL}/outfits/like", json=json)

        # check available outfit cards
        r = self.client.get(f"{BASE_URL}/outfits/getSwipableOutfits")
        assert len(r.json["outfits"]) is 0

        #     # unfollow outfit and check followers
        json = {"ids": [json["id"]]}
        r = self.client.put(f"{BASE_URL}/outfits/unlike", json=json)
        r = self.client.get(f"{BASE_URL}/outfits/getSwipableOutfits")

        assert len(r.json["outfits"]) is 0
