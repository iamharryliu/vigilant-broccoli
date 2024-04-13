from flask import current_app
from dataclasses import dataclass
from App import db, login_manager
from App.const import USER_CONFIG
import uuid
from flask_login import UserMixin
from itsdangerous.serializer import Serializer


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


@dataclass
class User(db.Model, UserMixin):
    id = db.Column(db.String, default=lambda: uuid.uuid4().hex, primary_key=True)
    username: str = db.Column(
        db.String(USER_CONFIG.MAX_USERNAME_LENGTH), unique=True, nullable=False
    )
    email: str = db.Column(
        db.String(USER_CONFIG.MAX_EMAIL_LENGTH), unique=True, nullable=False
    )
    password = db.Column(db.String(USER_CONFIG.MAX_PASSWORD_LENGTH), nullable=False)

    def get_token(self, expires_sec=1800):
        s = Serializer(current_app.config["SECRET_KEY"], expires_sec)
        return s.dumps({"user_id": self.id}).decode("utf-8")

    @staticmethod
    def verify_token(token):
        s = Serializer(current_app.config["SECRET_KEY"])
        try:
            user_id = s.loads(token)["user_id"]
        except:
            return None
        return User.query.get(user_id)
