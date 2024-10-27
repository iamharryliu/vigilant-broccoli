from flask import Blueprint
from App.utils import get_subdirectories, get_filename
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
