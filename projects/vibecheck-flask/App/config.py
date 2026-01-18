import os
from pathlib import Path
from sys import platform
from App.constants import BLUEPRINTS

DIR_PATH = os.path.dirname(os.path.realpath(__file__))
ROOT_PATH = os.path.abspath(os.path.join(DIR_PATH, os.pardir))


if "linux" in platform or "darwin" in platform:
    fname = "/etc/config.json"
else:
    home = str(Path.home()).replace("\\", "/")[2:]
    fname = f"{home}/.config.json"


class ENVIRONMENT_TYPE:
    TEST = "TEST"
    DIT = "DIT"
    SIT = "SIT"
    PROD = "PROD"


LOCAL_BUCKET_ENVIRONMENTS = [ENVIRONMENT_TYPE.TEST, ENVIRONMENT_TYPE.DIT]


class APP_CONFIG:
    DAILY_OUTFIT_UPLOAD_LIMIT = 3
    OUTFIT_QUERY_LIMIT = 1000
    IMAGE_OUTPUT_SIZE = (768, 1280)
    USER_THUMBNAIL_SIZE = (200, 200)
    HASH_TAG_LIMIT = 10
    MAX_SWIPE_LIMIT = 50
    LIST_VIEW_ITEMS_PER_PAGE = 9


class SERVER_CONFIG:
    FRONTEND_APPLICATION_URL = "http://localhost:4200"
    SECRET_KEY = "secret_key"
    DEBUG = True
    PORT_NUMBER = 5000
    # Content
    BUCKET_NAME = "static"
    PROFILE_IMAGES_DIRECTORY = "profile_images"
    OUTFIT_IMAGES_DIRECTORY = "outfit_images"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Email
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MY_EMAIL")
    MAIL_PASSWORD = os.environ.get("MY_EMAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MY_EMAIL")

    FILTER_INTERACTED_CARDS = True

    CLOUDFLARE_ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")


class TEST_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "TEST"
    BUCKET_NAME = "static/test"
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{ROOT_PATH}/test.db"


class DIT_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "DIT"
    BUCKET_NAME = "static"
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{ROOT_PATH}/dev.db"


class SIT_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "SIT"
    BUCKET_NAME = "vibecheck-bucket"
    SQLALCHEMY_DATABASE_URI = os.environ.get("VIBECHECK_SQL_DB")
    FILTER_INTERACTED_CARDS = True


class PROD_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "PROD"
    SECRET_KEY = "prod_key"
    BUCKET_NAME = "vibecheck-bucket"
    SQLALCHEMY_DATABASE_URI = os.environ.get("VIBECHECK_SQL_DB")
    FRONTEND_APPLICATION_URL = "https://vibecheck-angular.harryliu.dev"
    DEBUG = False


class FILTER_CONFIG:
    DEFAULT_SORT_BY = "random"


class USER_CONFIG:
    MIN_USERNAME_LENGTH = 4
    MAX_USERNAME_LENGTH = 30
    MIN_EMAIL_LENGTH = 3
    MAX_EMAIL_LENGTH = 254
    MIN_PASSWORD_LENGTH = 8
    MAX_PASSWORD_LENGTH = 128
    MAX_DESCRIPTION_LENGTH = 2200


class OUTFIT_CONFIG:
    MAX_NAME_LENGTH = 50
    MAX_DESCRIPTION_LENGTH = 320
    TAG_LIMIT = 30
