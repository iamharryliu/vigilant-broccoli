import os
from flask import current_app


def get_local_path(filepath):
    return os.path.join(
        current_app.root_path,
        current_app.config["BUCKET_NAME"],
        filepath,
    )


def save_file_to_local_path(file, filepath):
    filepath = get_local_path(filepath)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "wb") as f:
        f.write(file.read())