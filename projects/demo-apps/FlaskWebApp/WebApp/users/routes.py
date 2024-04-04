from flask import (
    Blueprint,
    render_template,
    redirect,
    url_for,
    request,
    session,
    flash,
    abort,
)
from flask_login import login_user, current_user, logout_user, login_required
from WebApp.models import User
from WebApp.users.forms import (
    RegistrationForm,
    LoginForm,
    UpdateAccountForm,
    RequestResetForm,
    ResetPasswordForm,
)
from WebApp.users.utils import (
    confirm_email,
    register_user,
    update_user_info,
    send_reset_request_email,
    login_user,
    set_new_password,
    handle_login,
)
from WebApp.posts.forms import PostForm
from WebApp.posts.utils import add_post, get_paginated_user_posts, get_redirects
from WebApp.store.utils import create_anon_cart

users_blueprint = Blueprint("users", __name__, template_folder="templates")


@users_blueprint.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))
    form = RegistrationForm()
    if form.validate_on_submit():
        register_user()
        return redirect(url_for("users.login"))
    return render_template("users/register.html", title="Register", form=form)


@users_blueprint.route("/confirm_email/<token>", methods=["GET", "POST"])
def confirm_email_token(token):
    user = User.verify_confirm_email_token(token)
    if user is None:
        flash("Invalid or expired token.", "warning")
        return redirect(url_for("users.register"))
    confirm_email(user)
    return redirect(url_for("posts.posts"))


@users_blueprint.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))
    form = LoginForm()
    if form.validate_on_submit():
        return handle_login()
    return render_template("users/login.html", title="Login", form=form)


@users_blueprint.route("/logout")
def logout():
    logout_user()
    session.clear()
    create_anon_cart()
    flash("You have been logged out.", "success")
    return redirect(url_for("main.home"))


@users_blueprint.route("/<string:username>", methods=["GET", "POST"])
@users_blueprint.route("/<string:username>/posts", methods=["GET", "POST"])
def user_posts(username):
    create_post_form = PostForm()
    if create_post_form.validate_on_submit():
        add_post()
        return redirect(request.form["url"])
    user = User.query.filter_by(username=username).first_or_404()
    posts = get_paginated_user_posts(user)
    update_post_form = PostForm()
    redirect_dict = get_redirects(username=username)
    return render_template(
        "posts/user-posts/view.html",
        title="Home",
        user=user,
        create_post_form=create_post_form,
        update_post_form=update_post_form,
        create_redirect=redirect_dict["create"],
        update_redirect=redirect_dict["update"],
        delete_redirect=redirect_dict["delete"],
        posts=posts,
    )


@users_blueprint.route("/settings", methods=["GET", "POST"])
@login_required
def account_settings():
    form = UpdateAccountForm()
    if form.validate_on_submit():
        update_user_info()
        return redirect(
            url_for("users.account_settings", username=current_user.username)
        )
    form.username.data = current_user.username
    form.email.data = current_user.email
    form.subscription_status.data = current_user.subscription_status
    return render_template(
        "users/account/settings/view.html",
        title="Account",
        user=current_user,
        form=form,
    )


@users_blueprint.route("/reset_password", methods=["GET", "POST"])
def reset_request():
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))
    form = RequestResetForm()
    if form.validate_on_submit():
        send_reset_request_email()
        return redirect(url_for("users.login"))
    return render_template(
        "users/reset_request.html", title="Reset Password", form=form
    )


@users_blueprint.route("/reset_password/<token>", methods=["GET", "POST"])
def reset_password_token(token):
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))
    user = User.verify_reset_password_token(token)
    if user is None:
        flash("Invalid or expired token.", "warning")
        return redirect(url_for("users.reset_request"))
    form = ResetPasswordForm()
    if form.validate_on_submit():
        set_new_password(user)
        return redirect(url_for("posts.posts"))
    return render_template("users/reset-token.html", title="Reset Password", form=form)
