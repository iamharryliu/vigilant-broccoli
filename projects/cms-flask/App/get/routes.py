from flask import Blueprint
from common.utils import get_filename
from App.utils.file_utils.s3_utils import get_subdirectories, get_filenames
from flask_cors import cross_origin

get_blueprint = Blueprint(
    "get",
    __name__,
)


@get_blueprint.route("/albums")
@cross_origin()
def get_albums():
    directories = [get_filename(path) for path in get_subdirectories("images/")]
    return directories


@get_blueprint.route("/albums/<albumId>")
@cross_origin()
def get_album(albumId):
    filenames = get_filenames(f"images/{albumId}/")
    return filenames
