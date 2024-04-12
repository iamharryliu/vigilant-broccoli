from flask import (
    Blueprint,
    render_template,
    redirect,
    url_for,
)
from flask_login import current_user
from WebApp.users.forms import (
    RegistrationForm,
)
from WebApp.users.utils import (
    register_user,
)
from WebApp.models import User

users_blueprint = Blueprint(
    "users", __name__, template_folder="templates", url_prefix="/users"
)


@users_blueprint.route("/get_users")
def get_users():
    users = User.query.all()
    return {"users": users}


@users_blueprint.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))
    form = RegistrationForm()
    if form.validate_on_submit():
        register_user()
        return redirect(url_for("main.home"))
    return render_template("forms/register_form.html", title="Register", form=form)
