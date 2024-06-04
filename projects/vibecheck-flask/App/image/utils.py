from flask import current_app
from App.config import LOCAL_BUCKET_ENVIRONMENTS
import secrets, os, base64, re
from io import BytesIO
from PIL import Image as PIL_Image
import boto3


def save_picture(picture, location, image_size):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(picture.filename)
    picture_fn = random_hex + f_ext
    image = PIL_Image.open(picture)
    image = image.resize(image_size, PIL_Image.LANCZOS)
    # TODO: image service DI
    if current_app.config["ENVIRONMENT"] not in LOCAL_BUCKET_ENVIRONMENTS:
        s3 = boto3.client(
            service_name="s3",
            endpoint_url=f"https://{current_app.config['CLOUDFLARE_ID']}.r2.cloudflarestorage.com",
            aws_access_key_id=current_app.config["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=current_app.config["AWS_SECRET_ACCESS_KEY"],
            region_name="eeur",  # Must be one of: wnam, enam, weur, eeur, apac, auto
        )

        img_bytes_io = BytesIO()
        image.save(img_bytes_io, format="JPEG")
        img_bytes = img_bytes_io.getvalue()
        s3.upload_fileobj(
            BytesIO(img_bytes),
            current_app.config["BUCKET_NAME"],
            f"{current_app.config['PROFILE_IMAGES']}/{picture_fn}",
        )

    else:
        filepath = os.path.join(
            current_app.root_path,
            f"{current_app.config['BUCKET_NAME']}/{current_app.config['PROFILE_IMAGES_DIRECTORY']}/{location}",
            picture_fn,
        )
        image.save(filepath)

    return picture_fn


# TODO: location?
def save_picture_base64(picture, location, image_size):
    random_hex = secrets.token_hex(8)
    picture_fn = random_hex + ".jpg"
    image = PIL_Image.open(
        BytesIO(base64.b64decode(re.sub("^data:image/.+;base64,", "", picture)))
    ).convert("RGB")
    image = image.resize(image_size, PIL_Image.LANCZOS)

    if current_app.config["ENVIRONMENT"] not in LOCAL_BUCKET_ENVIRONMENTS:
        s3 = boto3.client(
            service_name="s3",
            endpoint_url=f"https://{current_app.config['CLOUDFLARE_ID']}.r2.cloudflarestorage.com",
            aws_access_key_id=current_app.config["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=current_app.config["AWS_SECRET_ACCESS_KEY"],
            region_name="eeur",  # Must be one of: wnam, enam, weur, eeur, apac, auto
        )
        img_bytes_io = BytesIO()
        image.save(img_bytes_io, format="JPEG")
        img_bytes = img_bytes_io.getvalue()
        s3.upload_fileobj(
            BytesIO(img_bytes),
            current_app.config["BUCKET_NAME"],
            f"{current_app.config['OUTFIT_IMAGES']}/{picture_fn}",
        )
    else:
        filepath = os.path.join(
            current_app.root_path,
            f"{current_app.config['BUCKET_NAME']}/{current_app.config['OUTFIT_IMAGES_DIRECTORY']}",
            picture_fn,
        )
        image.save(filepath)
    return picture_fn
