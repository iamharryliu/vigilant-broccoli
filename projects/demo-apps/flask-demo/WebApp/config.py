import os

DIR_PATH = os.path.dirname(os.path.realpath(__file__))
ROOT_PATH = os.path.abspath(os.path.join(DIR_PATH, os.pardir))


class SERVER_CONFIG:
    PORT_NUMBER = 5000
    DEBUG = True
    SECRET_KEY = os.environ.get("SECRET_KEY")

    # Flask-SQLAlchemy
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{ROOT_PATH}/site.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask-Mail
    MAIL_SERVER = "smtp.googlemail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("EMAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("EMAIL_DEFAULT_SENDER")

    # Flask-WTF
    RECAPTCHA_USE_SSL = os.environ.get("RECAPTCHA_USE_SSL")
    RECAPTCHA_PUBLIC_KEY = os.environ.get("RECAPTCHA_PUBLIC_KEY")
    RECAPTCHA_PRIVATE_KEY = os.environ.get("RECAPTCHA_PRIVATE_KEY")
    RECAPTCHA_OPTIONS = os.environ.get("RECAPTCHA_OPTIONS")


class TEST_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "TEST"


class DIT_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "DIT"


class SIT_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "SIT"


class PROD_CONFIG(SERVER_CONFIG):
    ENVIRONMENT = "PROD"
