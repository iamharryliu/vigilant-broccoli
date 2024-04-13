from flask import Blueprint
from App.const import HTTP_STATUS_CODES

errors_blueprint = Blueprint("errors", __name__)


# Bad request.
@errors_blueprint.app_errorhandler(HTTP_STATUS_CODES.BAD_REQUEST)
def error_400(error):
    return {"error": str(error)}, HTTP_STATUS_CODES.BAD_REQUEST


# Unauthorized request.
@errors_blueprint.app_errorhandler(HTTP_STATUS_CODES.UNAUTHORIZED_REQUEST)
def error_401(error):
    return {"error": str(error)}, HTTP_STATUS_CODES.UNAUTHORIZED_REQUEST


# Forbidden request.
@errors_blueprint.app_errorhandler(HTTP_STATUS_CODES.FORBIDDEN_REQUEST)
def error_403(error):
    return {"error": str(error)}, HTTP_STATUS_CODES.FORBIDDEN_REQUEST


# Not found error.
@errors_blueprint.app_errorhandler(HTTP_STATUS_CODES.NOT_FOUND_ERROR)
def error_404(error):
    return {"error": str(error)}, HTTP_STATUS_CODES.NOT_FOUND_ERROR


# Internal server error.
@errors_blueprint.app_errorhandler(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
def error_500(error):
    return {"error": str(error)}, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
