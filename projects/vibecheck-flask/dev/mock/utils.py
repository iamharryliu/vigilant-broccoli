from App import bcrypt
from App.config import APP_CONFIG
from App.constants import GENDERS, SEASONS
from App.models import User, Outfit, Image, Tag, Filter
from App.tag.utils import create_tags
from dev.mock.data import MOCK_TAGS
import random
from flask import current_app
import secrets
import os
from PIL import Image as PIL_Image
from io import BytesIO
import boto3
import utils

HASHED_PASSWORD = bcrypt.generate_password_hash("password").decode("utf-8")

MOCK_PROFILE_IMAGES_DIRECTORY = "dev/mock/images/profiles"
MOCK_OUTFITS_IMAGES_DIRECTORY = "dev/mock/images/outfits"


class MOCK_CONFIG:
    NUMBER_OF_MOCK_USERS = 1
    OUTFIT = {
        "winter": {
            "MAX_TEMP": 278,
            "MIN_TEMP": 268,
        },
        "spring": {
            "MIN_TEMP": 278,
            "MAX_TEMP": 293,
        },
        "summer": {
            "MIN_TEMP": 293,
            "MAX_TEMP": 303,
        },
        "fall": {
            "MIN_TEMP": 283,
            "MAX_TEMP": 293,
        },
    }


TAGS_TEXT = f"#{' #'.join(MOCK_TAGS)}"


def reset_mock(db):
    print("Mock reset starting")
    utils.setup_db(db)
    delete_mock_users(db)
    add_mock_users(db)
    print("Mock reset done.")


def delete_mock_users(db):
    print("Deleting mock users.")
    for i in range(MOCK_CONFIG.NUMBER_OF_MOCK_USERS):
        user = User.query.filter_by(username=f"user{i+1}").first()
        if user:
            db.session.delete(user)
    db.session.commit()


def add_mock_users(db):
    print("Creating mock users.")
    profile_images = os.listdir(MOCK_PROFILE_IMAGES_DIRECTORY)

    for i in range(1):
        user = User(
            username=f"user{i+1}",
            password=HASHED_PASSWORD,
        )
        filename = random.choice(profile_images)
        random_hex = secrets.token_hex(8)
        _, f_ext = os.path.splitext(filename)
        picture_fn = random_hex + f_ext
        picture_path = os.path.join(
            current_app.root_path,
            current_app.config["BUCKET_NAME"],
            current_app.config["PROFILE_IMAGES_DIRECTORY"],
            picture_fn,
        )
        i = PIL_Image.open(f"{MOCK_PROFILE_IMAGES_DIRECTORY}/{filename}")
        i.thumbnail(APP_CONFIG.USER_THUMBNAIL_SIZE)
        if current_app.config["ENVIRONMENT"] in ["TEST", "DIT"]:
            i.save(picture_path)
        if current_app.config["ENVIRONMENT"] in ["SIT", "PROD"]:
            s3 = boto3.client(
                service_name="s3",
                endpoint_url=f"https://{current_app.config['CLOUDFLARE_ID']}.r2.cloudflarestorage.com",
                aws_access_key_id=current_app.config["AWS_ACCESS_KEY_ID"],
                aws_secret_access_key=current_app.config["AWS_SECRET_ACCESS_KEY"],
                region_name="eeur",  # Must be one of: wnam, enam, weur, eeur, apac, auto
            )

            img_bytes_io = BytesIO()
            i.save(img_bytes_io, format="JPEG")
            img_bytes = img_bytes_io.getvalue()
            s3.upload_fileobj(
                BytesIO(img_bytes),
                current_app.config["BUCKET_NAME"],
                f"{current_app.config['PROFILE_IMAGES_DIRECTORY']}/{picture_fn}",
            )
        user.image_file = picture_fn
        db.session.add(user)
        db.session.commit()

        _filter = Filter(
            owner=user,
            is_default=True,
        )
        db.session.add(_filter)
        for gender in GENDERS:
            for season in SEASONS:
                for filename in os.listdir(
                    f"{MOCK_OUTFITS_IMAGES_DIRECTORY}/{gender}/{season}"
                ):
                    description = f"Mock user's {gender} {season} fit. {TAGS_TEXT}"
                    tags = create_tags(description)
                    outfit = Outfit(
                        stylist=user,
                        gender=gender,
                        season=season,
                        temperature=random.randint(
                            MOCK_CONFIG.OUTFIT[season]["MIN_TEMP"],
                            MOCK_CONFIG.OUTFIT[season]["MAX_TEMP"],
                        ),
                        name=f"{user.username}'s first outfit",
                        description=description,
                    )
                    outfit.tags[:] = [Tag.query.filter_by(name=tag)[0] for tag in tags]
                    random_hex = secrets.token_hex(8)
                    _, f_ext = os.path.splitext(filename)
                    picture_fn = random_hex + f_ext
                    picture_path = f"{current_app.root_path}/{current_app.config['BUCKET_NAME']}/{current_app.config['OUTFIT_IMAGES_DIRECTORY']}/{picture_fn}"
                    i = PIL_Image.open(
                        f"{MOCK_OUTFITS_IMAGES_DIRECTORY}/{gender}/{season}/{filename}"
                    )
                    i = i.resize(APP_CONFIG.IMAGE_OUTPUT_SIZE, PIL_Image.LANCZOS)
                    if current_app.config["ENVIRONMENT"] in ["TEST", "DIT"]:
                        i.save(picture_path)
                    if current_app.config["ENVIRONMENT"] in ["SIT", "PROD"]:
                        s3 = boto3.client(
                            service_name="s3",
                            endpoint_url=f"https://{current_app.config['CLOUDFLARE_ID']}.r2.cloudflarestorage.com",
                            aws_access_key_id=current_app.config["AWS_ACCESS_KEY_ID"],
                            aws_secret_access_key=current_app.config[
                                "AWS_SECRET_ACCESS_KEY"
                            ],
                            region_name="eeur",  # Must be one of: wnam, enam, weur, eeur, apac, auto
                        )

                        img_bytes_io = BytesIO()
                        i.save(img_bytes_io, format="JPEG")
                        img_bytes = img_bytes_io.getvalue()
                        s3.upload_fileobj(
                            BytesIO(img_bytes),
                            current_app.config["BUCKET_NAME"],
                            f"{current_app.config['OUTFIT_IMAGES_DIRECTORY']}/{picture_fn}",
                        )
                    image = Image(image_file=picture_fn)
                    db.session.add(image)
                    outfit.images.append(image)
                    db.session.add(outfit)

    db.session.commit()
