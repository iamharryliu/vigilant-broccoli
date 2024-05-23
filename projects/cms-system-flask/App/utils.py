from flask import current_app
from App.config import LOCAL_BUCKET_ENVIRONMENTS
import os
from io import BytesIO
import boto3


def save_text(text):
    fname = "calendar.md"
    text_bytes = text.encode("utf-8")
    if current_app.config["ENVIRONMENT"] not in LOCAL_BUCKET_ENVIRONMENTS:
        s3 = boto3.client(
            service_name="s3",
            endpoint_url=f"https://{current_app.config['CLOUDFLARE_ID']}.r2.cloudflarestorage.com",
            aws_access_key_id=current_app.config["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=current_app.config["AWS_SECRET_ACCESS_KEY"],
            region_name="eeur",
        )

        s3.upload_fileobj(
            BytesIO(text_bytes),
            current_app.config["BUCKET_NAME"],
            f"{current_app.config['CONTENT_DIRECTORY']}/{fname}",
        )

    else:
        filepath = os.path.join(
            current_app.root_path,
            f"{current_app.config['BUCKET_NAME']}/{current_app.config['CONTENT_DIRECTORY']}",
            fname,
        )
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(text_bytes)
    return fname


def get_text():
    fname = "calendar.md"
    if current_app.config["ENVIRONMENT"] not in LOCAL_BUCKET_ENVIRONMENTS:
        s3 = boto3.client(
            service_name="s3",
            endpoint_url=f"https://{current_app.config['CLOUDFLARE_ID']}.r2.cloudflarestorage.com",
            aws_access_key_id=current_app.config["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=current_app.config["AWS_SECRET_ACCESS_KEY"],
            region_name="eeur",
        )

        file_obj = BytesIO()
        s3.download_fileobj(
            current_app.config["BUCKET_NAME"],
            f"{current_app.config['CONTENT_DIRECTORY']}/{fname}",
            file_obj,
        )
        file_obj.seek(0)
        text = file_obj.read().decode("utf-8")

    else:
        filepath = os.path.join(
            current_app.root_path,
            f"{current_app.config['BUCKET_NAME']}/{current_app.config['CONTENT_DIRECTORY']}",
            fname,
        )
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()

    return text
