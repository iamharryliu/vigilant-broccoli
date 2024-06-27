from flask import current_app
from dataclasses import dataclass
from App import db, login_manager
from App.const import USER_CONFIG, TOKEN_EXPIRE_TIME_IN_SECONDS
import uuid
from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer as Serializer


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


@dataclass
class User(db.Model, UserMixin):
    id = db.Column(db.String, default=lambda: uuid.uuid4().hex, primary_key=True)
    username: str = db.Column(
        db.String(USER_CONFIG.MAX_USERNAME_LENGTH), unique=True, nullable=False
    )
    email: str = db.Column(db.String(USER_CONFIG.MAX_EMAIL_LENGTH), unique=True)
    is_verified: str = db.Column(db.Boolean, default=False)
    password = db.Column(db.String(USER_CONFIG.MAX_PASSWORD_LENGTH), nullable=False)
    privileges = db.relationship(
        "Privilege", back_populates="user", cascade="all, delete-orphan"
    )

    def get_token(self):
        s = Serializer(current_app.config["SECRET_KEY"])
        return s.dumps({"user_id": self.id})

    def add_privilege(self, application_type):
        new_privilege = Privilege(user_id=self.id, application_type=application_type)
        db.session.add(new_privilege)
        db.session.commit()

    def has_privilege(self, application_type):
        return any(
            priv.application_type == application_type for priv in self.privileges
        )

    @staticmethod
    def verify_token(token):
        s = Serializer(current_app.config["SECRET_KEY"])
        try:
            user_id = s.loads(token, max_age=TOKEN_EXPIRE_TIME_IN_SECONDS)["user_id"]
        except:
            return None
        return User.query.get(user_id)


@dataclass
class Privilege(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey("user.id"), nullable=False)
    application_type = db.Column(db.String, unique=True, nullable=False)
    user = db.relationship("User", back_populates="privileges")
