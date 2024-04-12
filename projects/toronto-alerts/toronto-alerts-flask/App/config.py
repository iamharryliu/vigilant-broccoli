import os

DIR_PATH = os.path.dirname(os.path.realpath(__file__))
ROOT_PATH = os.path.abspath(os.path.join(DIR_PATH, os.pardir))


class SERVER_CONFIG:
    PORT_NUMBER = 5000
    DEBUG = True
    SECRET_KEY = os.environ.get("SECRET_KEY")
    RECAPTCHA_SITE_KEY = os.environ.get("GTA_UPDATE_ALERTS_RECAPTCHA_SITE_KEY")
    RECAPTCHA_SECRET_KEY = os.environ.get("GTA_UPDATE_ALERTS_RECAPTCHA_SECRET_KEY")


class TEST_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "TEST"


class DIT_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "DIT"


class SIT_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "SIT"


class PROD_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "PROD"
