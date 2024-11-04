from flask import Blueprint
from common.utils import get_filename
from App.utils.file_utils.s3_utils import (
    get_subdirectories_and_first_image,
    get_filenames,
)
from flask_cors import cross_origin

get_blueprint = Blueprint(
    "get",
    __name__,
)


@get_blueprint.route("/<app_name>/albums")
@cross_origin()
def get_albums(app_name):
    return get_subdirectories_and_first_image(app_name, "images")


@get_blueprint.route("/<app_name>/albums/<albumId>")
@cross_origin()
def get_album(app_name, albumId):
    return get_filenames(app_name, f"images/{albumId}")
