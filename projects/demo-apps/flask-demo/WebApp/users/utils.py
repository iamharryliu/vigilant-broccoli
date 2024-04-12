from flask import flash
from flask_mail import Message
from WebApp import db, bcrypt, mail
from WebApp.models import User
from WebApp.users.forms import (
    RegistrationForm,
)


def register_user():
    form = RegistrationForm()
    hashed_password = bcrypt.generate_password_hash(form.password.data).decode("utf-8")
    user = User(
        username=form.username.data, email=form.email.data, password=hashed_password
    )
    db.session.add(user)
    db.session.commit()
    send_register_email(user)
    flash(f"Account created for {form.username.data}! You can now login.", "success")


def send_register_email(user):
    msg = Message("You have signed up.", recipients=[user.email])
    msg.body = "You have signed up."
    mail.send(msg)
