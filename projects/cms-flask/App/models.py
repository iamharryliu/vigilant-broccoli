from flask import current_app
from App import db, login_manager
from App.const import USER_TYPE
from App.const import USER_CONFIG, TOKEN_EXPIRE_TIME_IN_SECONDS
import uuid
from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer as Serializer
from datetime import datetime


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


class User(db.Model, UserMixin):
    id = db.Column(db.String, default=lambda: uuid.uuid4().hex, primary_key=True)
    username = db.Column(
        db.String(USER_CONFIG.MAX_USERNAME_LENGTH), unique=True, nullable=False
    )
    email = db.Column(db.String(USER_CONFIG.MAX_EMAIL_LENGTH), unique=True)
    is_verified = db.Column(db.Boolean, default=False)
    password = db.Column(db.String(USER_CONFIG.MAX_PASSWORD_LENGTH), nullable=False)
    user_type = db.Column(db.String, default=USER_TYPE.USER, nullable=False)
    user_applications = db.relationship("UserApplication", backref="user", lazy=True)

    def get_token(self):
        s = Serializer(current_app.config["SECRET_KEY"])
        return s.dumps({"user_id": self.id})

    def add_privilege(self, application, privilege):
        new_privilege = UserApplication(
            user_id=self.id, application_id=application.id, privilege_id=privilege.id
        )
        db.session.add(new_privilege)
        db.session.commit()

    def has_privilege(self, app_name):
        application = Application.query.filter_by(name=app_name).first()
        return (
            UserApplication.query.filter_by(
                user_id=self.id, application_id=application.id
            ).first()
            is not None
        )

    @staticmethod
    def verify_token(token):
        s = Serializer(current_app.config["SECRET_KEY"])
        try:
            user_id = s.loads(token, max_age=TOKEN_EXPIRE_TIME_IN_SECONDS)["user_id"]
        except:
            return None
        return User.query.get(user_id)


class Privilege(db.Model):
    id = db.Column(db.String, default=lambda: uuid.uuid4().hex, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    user_applications = db.relationship(
        "UserApplication", backref="privilege", lazy=True
    )


class Application(db.Model):
    id = db.Column(db.String, default=lambda: uuid.uuid4().hex, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.now())
    updated_at = db.Column(db.DateTime, default=datetime.now(), onupdate=datetime.now())
    user_applications = db.relationship(
        "UserApplication", backref="application", lazy=True
    )


class UserApplication(db.Model):
    id = db.Column(db.String, default=lambda: uuid.uuid4().hex, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey("user.id"), nullable=False)
    application_id = db.Column(
        db.String, db.ForeignKey("application.id"), nullable=False
    )
    privilege_id = db.Column(db.String, db.ForeignKey("privilege.id"), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.now())
    expires_at = db.Column(db.DateTime, nullable=True)
    db.UniqueConstraint("user_id", "application_id", name="unique_user_application")
