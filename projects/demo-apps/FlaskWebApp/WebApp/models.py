from flask import current_app
from flask_login import UserMixin
from WebApp import db, login_manager

import uuid
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer


class User(db.Model, UserMixin):
    id = db.Column(db.String, default=lambda: uuid.uuid4().hex, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    image_file = db.Column(db.String(20), nullable=False, default="default.jpg")
    password = db.Column(db.String(60), nullable=False)
    confirmed_email = db.Column(db.Boolean, default=False)
    subscription_status = db.Column(db.Boolean, default=True)
    posts = db.relationship("Post", backref="author", cascade="all,delete", lazy=True)
    carts = db.relationship("Cart", backref="customer", cascade="all,delete", lazy=True)
    orders = db.relationship(
        "Order", backref="customer", cascade="all,delete", lazy=True
    )

    def get_confirm_email_token(self):
        s = Serializer(current_app.config["SECRET_KEY"])
        return s.dumps({"user_id": self.id}).decode("utf-8")

    @staticmethod
    def verify_confirm_email_token(token):
        s = Serializer(current_app.config["SECRET_KEY"])
        try:
            user_id = s.loads(token)["user_id"]
        except:
            return None
        return User.query.get(user_id)

    def get_reset_password_token(self, expires_sec=1800):
        s = Serializer(current_app.config["SECRET_KEY"], expires_sec)
        return s.dumps({"user_id": self.id}).decode("utf-8")

    @staticmethod
    def verify_reset_password_token(token):
        s = Serializer(current_app.config["SECRET_KEY"])
        try:
            user_id = s.loads(token)["user_id"]
        except:
            return None
        return User.query.get(user_id)

    def __repr__(self):
        return f"{self.username}"
