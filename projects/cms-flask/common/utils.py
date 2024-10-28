import os
import uuid


def write_to_file(filepath):
    if not os.path.exists(filepath):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        open(filepath, "wb").close()


def generate_uuid():
    return uuid.uuid4().hex


def get_filename(path):
    normalized_path = os.path.normpath(path)
    folder_name = os.path.basename(normalized_path)
    return folder_name
