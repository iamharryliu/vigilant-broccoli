from flask import Blueprint, redirect, url_for
from App.const import HTTP_STATUS_CODE

errors_blueprint = Blueprint("errors", __name__)


# Bad request.
@errors_blueprint.app_errorhandler(HTTP_STATUS_CODE.BAD_REQUEST)
def error_400(error):
    return {"error": str(error)}, HTTP_STATUS_CODE.BAD_REQUEST


# Unauthorized request.
@errors_blueprint.app_errorhandler(HTTP_STATUS_CODE.UNAUTHORIZED_REQUEST)
def error_401(error):
    return {"error": str(error)}, HTTP_STATUS_CODE.UNAUTHORIZED_REQUEST


# Forbidden request.
@errors_blueprint.app_errorhandler(HTTP_STATUS_CODE.FORBIDDEN_REQUEST)
def error_403(error):
    return {"error": str(error)}, HTTP_STATUS_CODE.FORBIDDEN_REQUEST


# Not found error.
@errors_blueprint.app_errorhandler(HTTP_STATUS_CODE.NOT_FOUND_ERROR)
def error_404(error):
    return redirect(url_for("main.index"))


# Internal server error.
@errors_blueprint.app_errorhandler(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
def error_500(error):
    return {"error": str(error)}, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR
