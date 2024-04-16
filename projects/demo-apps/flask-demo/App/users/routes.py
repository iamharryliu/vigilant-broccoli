from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import current_user, logout_user
from App.users.forms import (
    RegistrationForm,
    LoginForm,
)
from App.users.utils import register_user, handle_login
from App.models import User

users_blueprint = Blueprint(
    "users", __name__, template_folder="templates", url_prefix="/users"
)


@users_blueprint.route("/")
def index():
    return render_template(
        "users_index.html",
        title="Users Index",
    )


@users_blueprint.route("/get_users")
def get_users():
    users = User.query.all()
    return {"users": users}


@users_blueprint.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("users.index"))
    form = RegistrationForm()
    if form.validate_on_submit():
        register_user()
        return redirect(url_for("users.index"))
    return render_template("forms/register_form.html", title="Register", form=form)


@users_blueprint.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("users.index"))
    form = LoginForm()
    if form.validate_on_submit():
        return handle_login()
    return render_template("forms/login_form.html", title="Login", form=form)


@users_blueprint.route("/logout")
def logout():
    logout_user()
    flash("You have been logged out.", "success")
    return redirect(url_for("users.index"))


@users_blueprint.route("/verify")
def verify_user():
    token = request.args.get("token")
    if User.verify_token(token):
        flash("User has been verified.", "success")
    else:
        flash("Invalid request", "error")
    return redirect(url_for("users.index"))
