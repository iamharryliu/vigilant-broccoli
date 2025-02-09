from typing import List, Optional
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


def upload_s3_file(file, filepath, app_name):
    s3_client = get_s3_client()
    s3_client.upload_fileobj(file, app_name, filepath)


def get_subdirectories(app_name, prefix=None):
    s3_client = get_s3_client()
    s3_objects = s3_client.list_objects(
        Bucket=app_name,
        Prefix=ensure_trailing_slash(prefix),
        Delimiter="/",
    ).get("CommonPrefixes")
    return [d["Prefix"] for d in s3_objects] if s3_objects else []


def get_subdirectories_and_first_image(app_name, prefix=None):
    s3_client = get_s3_client()
    subdirectories = get_subdirectories(app_name, prefix)
    if not subdirectories:
        return []
    albums = []
    for subdir in subdirectories:
        album_name = subdir.rstrip("/").split("/")[-1]
        images = s3_client.list_objects(Bucket=app_name, Prefix=subdir).get("Contents")
        if not images:
            continue
        first_image_key = images[0]["Key"]
        albums.append(
            {
                "albumName": album_name,
                "firstImageUrl": f"https://bucket.cloud8skate.com/{first_image_key}",
            }
        )
    return albums


def get_filenames(app_name: str, prefix: Optional[str] = None) -> List[str]:
    s3_client = get_s3_client()
    s3_objects = s3_client.list_objects(
        Bucket=app_name,
        Prefix=ensure_trailing_slash(prefix),
        Delimiter="/",
    ).get("Contents")
    return [image["Key"] for image in s3_objects] if s3_objects else []


def get_s3_file(filepath, app_name):
    s3_client = get_s3_client()
    file_obj = BytesIO()
    s3_client.download_fileobj(app_name, filepath, file_obj)
    file_obj.seek(0)
    return file_obj


def delete_directory(prefix, app_name):
    s3_client = get_s3_client()
    response = s3_client.list_objects(
        Bucket=app_name, Prefix=ensure_trailing_slash(prefix)
    )
    if "Contents" not in response:
        flash(
            f"No objects found with prefix {prefix} in bucket {app_name}",
            "warning",
        )
        return
    objects_to_delete = [{"Key": obj["Key"]} for obj in response["Contents"]]
    if objects_to_delete:
        s3_client.delete_objects(
            Bucket=app_name,
            Delete={"Objects": objects_to_delete},
        )
    flash(
        f"All objects with prefix {prefix} have been deleted from bucket {app_name}",
        "success",
    )
