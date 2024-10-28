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
def helloWorld():
    directories = [get_filename(path) for path in get_subdirectories("images/")]
    return directories


@get_blueprint.route("/images")
@cross_origin()
def helloWorld2():
    filenames = get_filenames("images/test/")
    print(filenames)
    return filenames
