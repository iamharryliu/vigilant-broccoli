import subprocess
from flask import current_app
from App import bcrypt
from App.config import LOCAL_BUCKET_ENVIRONMENTS
from App.models import User, Filter, Image

import os, shutil
from random import randint
from getpass import getpass


def create_admin(db):
    username = input("Enter username: ")
    password = getpass("Enter password: ")
    confirm_password = getpass("Confirm password: ")
    if password != confirm_password:
        if input("Try again(y/n): ") == "y":
            create_admin(db)
        return
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, password=hashed_password, role="ADMIN")
    _filter = Filter(
        owner=user,
        is_default=True,
    )
    db.session.add(user)
    db.session.add(_filter)
    db.session.commit()
    print("Admin user has successfully been created.")


def setup_db(db):
    print("Db setup started.")
    clear_buckets()
    drop_db(db)
    create_db(db)
    print("Db setup done.")


def clear_app(db):
    clear_buckets()
    drop_db(db)


def create_directories():
    print("Creating empty directories")
    directories = [
        f"./App/{current_app.config['BUCKET_NAME']}/{current_app.config['PROFILE_IMAGES_DIRECTORY']}",
        f"./App/{current_app.config['BUCKET_NAME']}/{current_app.config['OUTFIT_IMAGES_DIRECTORY']}",
    ]
    for directory in directories:
        os.makedirs(directory)


def clear_buckets():
    print("Deleting directories.")
    if current_app.config["ENVIRONMENT"] in LOCAL_BUCKET_ENVIRONMENTS:
        directories = [f"./App/{current_app.config['BUCKET_NAME']}"]
        for directory in directories:
            if os.path.exists(directory):
                shutil.rmtree(directory)
        create_directories()
    else:
        endpoint_url = (
            f"https://{current_app.config['CLOUDFLARE_ACCOUNT_ID']}.r2.cloudflarestorage.com"
        )
        command = [
            "aws",
            "s3",
            "rm",
            f"s3://vibecheck-bucket",
            "--endpoint-url",
            endpoint_url,
            "--recursive",
        ]
        subprocess.run(command)


def create_db(db):
    print("Creating db.")
    db.create_all()


def drop_db(db):
    print("Dropping database.")
    db.drop_all()


def random_integer():
    min_ = 100
    max_ = 1000000000
    rand = randint(min_, max_)
    while User.query.get(rand) is not None:
        rand = randint(min_, max_)
    return rand


def cleanup(db):
    print("Image cleanup started.")
    delete_unassociated_images_from_db(db)
    delete_unassociated_files_from_system()
    db.session.commit()
    print("Image cleanup done.")


def delete_unassociated_images_from_db(db):
    print("Removing unassociated images from db.")
    Image.query.filter(Image.outfit_id is None).delete()
    db.session.commit()


def delete_unassociated_files_from_system():
    print("Removing unassociated image files from sysyem.")
    user_profile_images = [
        user.image_file for user in User.query.all() if user.image_file
    ]
    print(user_profile_images)
    images = [image.image_file for image in Image.query.all()] + user_profile_images
    uploads = os.listdir("App/static/uploads")
    diff = list(set(uploads) - set(images))
    os.chdir("App/static/uploads")
    for fname in diff:
        os.remove(fname)
