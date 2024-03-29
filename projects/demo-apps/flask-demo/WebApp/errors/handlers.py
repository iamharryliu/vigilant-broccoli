from flask import Blueprint, jsonify

errors = Blueprint("errors", __name__)


# Bad request.
@errors.app_errorhandler(400)
def error_400(error):
    return jsonify(error=str(error)), 400


# Unauthorized request.
@errors.app_errorhandler(401)
def error_401(error):
    return jsonify(error=str(error)), 401


# Forbidden request.
@errors.app_errorhandler(403)
def error_403(error):
    return jsonify(error=str(error)), 403


# Not found error.
@errors.app_errorhandler(404)
def error_404(error):
    return jsonify(error=str(error)), 404


# Internal server error.
@errors.app_errorhandler(500)
def error_500(error):
    return jsonify(error=str(error)), 500
