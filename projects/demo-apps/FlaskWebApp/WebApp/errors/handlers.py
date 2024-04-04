from flask import Blueprint, render_template

errors = Blueprint("errors", __name__, template_folder="templates")


# Bad request error.
@errors.app_errorhandler(400)
def error_400(error):
    return render_template("errors/400.html"), 400


# Unauthorized error.
@errors.app_errorhandler(401)
def error_401(error):
    return render_template("errors/401.html"), 401


# Unauthorized error.
@errors.app_errorhandler(403)
def error_403(error):
    return render_template("errors/401.html"), 403


# Not found error.
@errors.app_errorhandler(404)
def error_404(error):
    return render_template("errors/404.html"), 404


# Internal server error.
@errors.app_errorhandler(500)
def error_500(error):
    return render_template("errors/500.html"), 500
