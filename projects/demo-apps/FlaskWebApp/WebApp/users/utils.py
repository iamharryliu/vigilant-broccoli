from flask import url_for, current_app, flash, redirect, request, session
from flask_login import login_user, current_user, logout_user, login_required
from flask_mail import Message
from WebApp import db, bcrypt, mail
from WebApp.models import User, Cart
from WebApp.users.forms import (
    RegistrationForm,
    LoginForm,
    UpdateAccountForm,
    RequestResetForm,
    ResetPasswordForm,
)

import os, re, secrets
from PIL import Image


def send_register_email(user):
    msg = Message("Thanks for signing up.", recipients=[user.email])
    msg.body = f"""\
Hello {user.username}!

You have registered for an account on iamharryliu.com.

If you did not make this request then simply ignore this email.

Cheers,

Harry.
    """
    mail.send(msg)
    send_confirm_user_email(user)


def send_confirm_user_email(user):
    token = user.get_confirm_email_token()
    msg = Message("Confirm Email", recipients=[user.email])
    msg.body = f"""\
Hello {user.username}!

You have registered for an account on iamharryliu.com.

To confirm your account, visit the following link:
{url_for('users.confirm_email_token', token=token, _external=True)}
If you did not make this request then simply ignore this email.

Cheers,

Harry.
    """
    mail.send(msg)


def send_reset_request_email():
    form = RequestResetForm()
    user = User.query.filter_by(email=form.email.data).first()
    send_reset_email(user)
    flash("An email has been with instruction to reset your password.", "info")


def send_reset_email(user):
    token = user.get_reset_password_token()
    msg = Message("Password Reset Request", recipients=[user.email])
    msg.body = f"""\
To reset your password, visit the following link:
{url_for('users.reset_password_token', token=token, _external=True)}
If you did not make this request then simply ignore this email.
    """
    mail.send(msg)


def update_user_info():
    form = UpdateAccountForm()
    if form.picture.data:
        picture_file = save_picture(form.picture.data)
        current_user.image_file = picture_file
    current_user.username = form.username.data
    current_user.email = form.email.data
    current_user.subscription_status = form.subscription_status.data
    db.session.commit()
    flash("You account has been updated", "success")


def confirm_email(user):
    user.confirmed_email = True
    db.session.commit()
    flash(f"Your email has been confirmed. Enjoy full site functionality", "success")


def set_new_password(user):
    form = ResetPasswordForm()
    hashed_password = bcrypt.generate_password_hash(form.password.data).decode("utf-8")
    user.password = hashed_password
    db.session.commit()
    flash(f"Password has been updated! You can now login.", "success")


def handle_login():
    form = LoginForm()
    identification = form.identification.data
    if not re.match(r"[^@]+@[^@]+\.[^@]+", identification):
        user = User.query.filter_by(username=identification).first()
    else:
        user = User.query.filter_by(email=identification).first()
    if user and bcrypt.check_password_hash(user.password, form.password.data):
        session.clear()
        login_user(user, remember=form.remember.data)
        next_page = request.args.get("next")
        flash("Login successful!", "success")
        return redirect(next_page) if next_page else redirect(url_for("main.home"))
    else:
        flash("Login unsuccessful. Please check email and password.", "danger")
        return redirect(url_for("users.login"))


def save_picture(form_picture):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(
        current_app.root_path, "static/images/profile_pics", picture_fn
    )
    output_size = (125, 125)
    i = Image.open(form_picture)
    i.thumbnail(output_size)
    i.save(picture_path)
    return picture_fn
