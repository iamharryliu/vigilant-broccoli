from flask import flash, current_app
import boto3
from io import BytesIO


def ensure_trailing_slash(path: str) -> str:
    return path if path.endswith("/") else path + "/"


def get_s3_client():
    return boto3.client(
        service_name="s3",
        endpoint_url=f"https://{current_app.config['CLOUDFLARE_ID']}.r2.cloudflarestorage.com",
        aws_access_key_id=current_app.config["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=current_app.config["AWS_SECRET_ACCESS_KEY"],
        region_name="eeur",
    )


def upload_s3_file(file, filepath):
    s3_client = get_s3_client()
    s3_client.upload_fileobj(file, current_app.config["BUCKET_NAME"], filepath)


def get_subdirectories(prefix=None):
    s3_client = get_s3_client()
    s3_objects = s3_client.list_objects(
        Bucket=current_app.config["BUCKET_NAME"],
        Prefix=ensure_trailing_slash(prefix),
        Delimiter="/",
    ).get("CommonPrefixes")
    return [d["Prefix"] for d in s3_objects] if s3_objects else []


def get_filenames(prefix=None):
    s3_client = get_s3_client()
    s3_objects = s3_client.list_objects(
        Bucket=current_app.config["BUCKET_NAME"],
        Prefix=ensure_trailing_slash(prefix),
        Delimiter="/",
    ).get("Contents")
    return [d["Key"] for d in s3_objects] if s3_objects else []


def get_s3_file(filepath):
    s3_client = get_s3_client()
    file_obj = BytesIO()
    s3_client.download_fileobj(current_app.config["BUCKET_NAME"], filepath, file_obj)
    file_obj.seek(0)
    return file_obj


def delete_directory(prefix):
    s3_client = get_s3_client()
    response = s3_client.list_objects(
        Bucket=current_app.config["BUCKET_NAME"], Prefix=ensure_trailing_slash(prefix)
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
