from io import BytesIO
from common.utils import write_to_file
from flask import current_app
from App.config import LOCAL_BUCKET_ENVIRONMENTS
from App.utils.file_utils.s3_utils import upload_s3_file, get_s3_file
from App.utils.file_utils.local_utils import save_file_to_local_path, get_local_path


def save_text(text, filepath, app_name=None):
    text_bytes = BytesIO(text.encode("utf-8"))
    save_file(text_bytes, filepath, app_name)


def get_text_from_filepath(filepath, app_name=None):
    file_obj = get_file(filepath, app_name)
    return file_obj.read().decode("utf-8")


def save_file(file, filepath, app_name=None):
    if current_app.config["ENVIRONMENT"] not in LOCAL_BUCKET_ENVIRONMENTS:
        upload_s3_file(file, filepath, app_name)
    else:
        save_file_to_local_path(file, filepath)


def get_file(filepath, app_name=None):
    if current_app.config["ENVIRONMENT"] not in LOCAL_BUCKET_ENVIRONMENTS:
        return get_s3_file(filepath, app_name)
    else:
        filepath = get_local_path(filepath, app_name)
        # TODO: Should this be here? maybe do it inside the save instead and have a default for no content?
        write_to_file(filepath)
        with open(filepath, "rb") as f:
            return BytesIO(f.read())
