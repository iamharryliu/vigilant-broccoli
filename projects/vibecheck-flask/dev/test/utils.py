from flask import current_app
from App.config import TEST_CONFIG
from App import create_app


app = create_app(TEST_CONFIG)
ctx = app.app_context()
ctx.push()
BASE_URL = f"http://localhost:{current_app.config['PORT_NUMBER']}"


class DEFAULT_MOCK_USER:
    USERNAME = "user"
    EMAIL = "user@email.com"
    PASSWORD = "password"


# TODO: make email use the username
def get_user_registration_request(
    username=DEFAULT_MOCK_USER.USERNAME,
    email=DEFAULT_MOCK_USER.EMAIL,
    password=DEFAULT_MOCK_USER.PASSWORD,
):
    return {
        "username": username,
        "email": email,
        "password": password,
    }


def get_user_login_request(
    identification=DEFAULT_MOCK_USER.USERNAME, password=DEFAULT_MOCK_USER.PASSWORD
):
    return {"identification": identification, "password": password}


import base64


def encode_file_as_base64(file_path):
    with open(file_path, "rb") as file:
        # Read the contents of the file
        file_contents = file.read()

        # Encode the contents as Base64
        encoded_contents = base64.b64encode(file_contents)

        return encoded_contents.decode("utf-8")


# TODO: rename
def get_test_images():
    outfit = "dev/test/images/test_image.jpeg"
    return encode_file_as_base64(outfit)


def get_outfit_json(filenames):
    return {
        "name": "",
        "description": "",
        "gender": "unisex",
        "season": "fall",
        "filenames": filenames,
        "temperature": 4,
    }
