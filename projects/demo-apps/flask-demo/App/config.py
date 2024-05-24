import os

DIR_PATH = os.path.dirname(os.path.realpath(__file__))
ROOT_PATH = os.path.abspath(os.path.join(DIR_PATH, os.pardir))


PORT_NUMBER = 5000


class ENVIRONMENT_TYPE:
    TEST = "TEST"
    DIT = "DIT"
    SIT = "SIT"
    PROD = "PROD"


class SERVER_CONFIG:
    APP_NAME = "Flask Demo"
    PORT_NUMBER = PORT_NUMBER
    DEBUG = True
    SECRET_KEY = os.environ.get("SECRET_KEY")

    BACKEND_APP_URL = f"http://localhost:{PORT_NUMBER}"

    # Flask-SQLAlchemy
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{ROOT_PATH}/site.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask-Mail
    MAIL_SERVER = "smtp.googlemail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MY_EMAIL")
    MAIL_PASSWORD = os.environ.get("MY_EMAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MY_EMAIL")

    # Flask-WTF
    RECAPTCHA_USE_SSL = os.environ.get("RECAPTCHA_USE_SSL")
    RECAPTCHA_PUBLIC_KEY = os.environ.get("RECAPTCHA_PUBLIC_KEY")
    RECAPTCHA_PRIVATE_KEY = os.environ.get("RECAPTCHA_PRIVATE_KEY")
    RECAPTCHA_OPTIONS = os.environ.get("RECAPTCHA_OPTIONS")


class TEST_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = ENVIRONMENT_TYPE.TEST


class DIT_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = ENVIRONMENT_TYPE.DIT


class SIT_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = ENVIRONMENT_TYPE.SIT


class PROD_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = ENVIRONMENT_TYPE.PROD
