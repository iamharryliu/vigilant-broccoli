from flask import Blueprint, render_template, redirect, url_for
from flask_login import current_user
from App.users.forms import (
    LoginForm,
)
from App.users.utils import (
    handle_login,
    handle_logout,
)

users_blueprint = Blueprint(
    "users", __name__, template_folder="templates", url_prefix="/users"
)


@users_blueprint.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("cms.index"))
    form = LoginForm()
    if form.validate_on_submit():
        return handle_login()
    return render_template("forms/login_form.html", title="Login", form=form)


@users_blueprint.route("/logout")
def logout():
    return handle_logout()
