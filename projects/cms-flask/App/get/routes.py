from flask import Blueprint
from common.utils import get_filename
from App.utils.file_utils.s3_utils import get_subdirectories, get_filenames
from flask_cors import cross_origin

get_blueprint = Blueprint(
    "get",
    __name__,
)


@get_blueprint.route("/<app_name>/albums")
@cross_origin()
def get_albums(app_name):
    directories = [
        get_filename(path) for path in get_subdirectories(app_name, "images")
    ]
    return directories


@get_blueprint.route("/<app_name>/albums/<albumId>")
@cross_origin()
def get_album(app_name, albumId):
    filenames = get_filenames(app_name, f"images/{albumId}")
    return filenames
