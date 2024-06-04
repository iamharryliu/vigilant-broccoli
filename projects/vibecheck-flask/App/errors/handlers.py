from App.config import APP_CONFIG
from App.constants import BLUEPRINTS

ERROR_RESPONSES = {
    "403": {"error": "403"},
    "404": {"error": "404"},
    "500": {"error": "500"},
}

errors = BLUEPRINTS.ERROR_BLUEPRINT


@errors.app_errorhandler(403)
def error_403(error):
    return ERROR_RESPONSES["403"]


@errors.app_errorhandler(404)
def error_404(error):
    return ERROR_RESPONSES["404"]


@errors.app_errorhandler(500)
def error_500(error):
    return ERROR_RESPONSES["500"]
