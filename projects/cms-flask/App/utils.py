from flask import current_app, flash
from App.config import LOCAL_BUCKET_ENVIRONMENTS
import os
from io import BytesIO
import boto3


def get_s3_client():
    return boto3.client(
        service_name="s3",
        endpoint_url=f"https://{current_app.config['CLOUDFLARE_ID']}.r2.cloudflarestorage.com",
        aws_access_key_id=current_app.config["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=current_app.config["AWS_SECRET_ACCESS_KEY"],
        region_name="eeur",
    )


def get_local_path(fname):
    return os.path.join(
        current_app.root_path,
        current_app.config["BUCKET_NAME"],
        current_app.config["CONTENT_DIRECTORY"],
        fname,
    )


def save_file(file, filename):
    if current_app.config["ENVIRONMENT"] not in LOCAL_BUCKET_ENVIRONMENTS:
        s3_client = get_s3_client()
        s3_client.upload_fileobj(file, current_app.config["BUCKET_NAME"], filename)
    else:
        filepath = get_local_path(filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(file.read())
    return filename


def save_text(text, filename):
    text_bytes = BytesIO(text.encode("utf-8"))
    return save_file(text_bytes, filename)


def get_file(filename):
    if current_app.config["ENVIRONMENT"] not in LOCAL_BUCKET_ENVIRONMENTS:
        s3_client = get_s3_client()
        file_obj = BytesIO()
        s3_client.download_fileobj(
            current_app.config["BUCKET_NAME"], filename, file_obj
        )
        file_obj.seek(0)
        return file_obj
    else:
        filepath = get_local_path(filename)
        with open(filepath, "rb") as f:
            return BytesIO(f.read())


def get_text(filename):
    file_obj = get_file(filename)
    return file_obj.read().decode("utf-8")


def get_subdirectories(prefix=None):
    s3_client = get_s3_client()
    s3_objects = s3_client.list_objects(
        Bucket=current_app.config["BUCKET_NAME"], Prefix=prefix, Delimiter="/"
    ).get("CommonPrefixes")
    return [d["Prefix"] for d in s3_objects] if s3_objects else []


def get_filenames(prefix=None):
    s3_client = get_s3_client()
    s3_objects = [
        s3_client.list_objects(Bucket=current_app.config["BUCKET_NAME"], Prefix=prefix)
    ]
    return [f["Key"] for f in s3_objects[0]["Contents"]]


def delete_directory(prefix):
    s3_client = get_s3_client()
    response = s3_client.list_objects(
        Bucket=current_app.config["BUCKET_NAME"], Prefix=prefix
    )
    if "Contents" not in response:
        flash(
            f'No objects found with prefix {prefix} in bucket {current_app.config["BUCKET_NAME"]}',
            "warning",
        )
        return
    objects_to_delete = [{"Key": obj["Key"]} for obj in response["Contents"]]
    if objects_to_delete:
        s3_client.delete_objects(
            Bucket=current_app.config["BUCKET_NAME"],
            Delete={"Objects": objects_to_delete},
        )
    flash(
        f'All objects with prefix {prefix} have been deleted from bucket {current_app.config["BUCKET_NAME"]}',
        "success",
    )
