import re
from flask import flash, session, redirect, url_for, request, current_app
from flask_mail import Message
from flask_login import login_user, logout_user
from App import db, bcrypt, mail
from App.models import User
from App.users.forms import LoginForm


def send_register_email(user):
    msg = Message("Flask Demo: Verify Email", recipients=[user.email])
    token = user.get_token()
    msg.body = f"{current_app.config.get('BACKEND_APP_URL')}/users/verify?token={token}"
    mail.send(msg)


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
        return redirect(next_page) if next_page else redirect(url_for("cms.index"))
    else:
        flash("Login unsuccessful. Please check email and password.", "danger")
        return redirect(url_for("users.login"))


def handle_logout():
    logout_user()
    flash("You have been logged out.", "success")
    return redirect(url_for("users.login"))
