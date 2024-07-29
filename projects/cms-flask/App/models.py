from flask import current_app, redirect, url_for
from App import db, login_manager
from App.const import USER_TYPE, USER_CONFIG, TOKEN_EXPIRE_TIME_IN_SECONDS
from App.utils import generate_uuid
from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer as Serializer
from datetime import datetime, UTC


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


class Application(db.Model):
    id = db.Column(db.String, default=generate_uuid, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.Text)
    groups = db.relationship(
        "Group", secondary="application_group", back_populates="applications"
    )
    created_at = db.Column(db.DateTime, default=datetime.now(UTC))
    updated_at = db.Column(
        db.DateTime, default=datetime.now(UTC), onupdate=datetime.now(UTC)
    )

    def get_url(self):
        return url_for("cms.dashboard", app_name=self.name)

    def get_redirect(self):
        return redirect(self.get_url())


class Group(db.Model):
    id = db.Column(db.String, default=generate_uuid, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    applications = db.relationship(
        "Application", secondary="application_group", back_populates="groups"
    )
    users = db.relationship("User", secondary="user_group", back_populates="groups")
    created_at = db.Column(db.DateTime, default=datetime.now(UTC))
    updated_at = db.Column(
        db.DateTime, default=datetime.now(UTC), onupdate=datetime.now(UTC)
    )


class User(db.Model, UserMixin):
    id = db.Column(db.String, default=generate_uuid, primary_key=True)
    username = db.Column(
        db.String(USER_CONFIG.MAX_USERNAME_LENGTH), unique=True, nullable=False
    )
    email = db.Column(db.String(USER_CONFIG.MAX_EMAIL_LENGTH), unique=True)
    is_verified = db.Column(db.Boolean, default=False)
    password = db.Column(db.String(USER_CONFIG.MAX_PASSWORD_LENGTH), nullable=False)
    user_type = db.Column(db.String, default=USER_TYPE.USER, nullable=False)
    groups = db.relationship("Group", secondary="user_group", back_populates="users")

    def get_token(self):
        s = Serializer(current_app.config["SECRET_KEY"])
        return s.dumps({"user_id": self.id})

    @staticmethod
    def verify_token(token):
        s = Serializer(current_app.config["SECRET_KEY"])
        try:
            user_id = s.loads(token, max_age=TOKEN_EXPIRE_TIME_IN_SECONDS)["user_id"]
        except:
            return None
        return User.query.get(user_id)

    def has_privilege(self, app_name):
        application = Application.query.filter_by(name=app_name).first()
        if not application:
            return False
        for group in self.groups:
            if group in application.groups:
                return True
        return False

    def query_applications(self):
        return (
            db.session.query(Application)
            .join(application_group)
            .join(Group)
            .join(user_group)
            .filter(user_group.c.user_id == self.id)
        )

    def get_applications(self):
        return self.query_applications().all()

    def count_applications(self):
        return (
            db.session.query(Application)
            .join(application_group)
            .join(Group)
            .join(user_group)
            .filter(user_group.c.user_id == self.id)
            .count()
        )

    def get_url(self):
        return url_for("cms.user_details", username=self.username)

    def get_redirect(self):
        return redirect(self.get_url())


application_group = db.Table(
    "application_group",
    db.Column("application_id", db.String, db.ForeignKey("application.id")),
    db.Column("group_id", db.String, db.ForeignKey("group.id")),
)

user_group = db.Table(
    "user_group",
    db.Column("user_id", db.String, db.ForeignKey("user.id")),
    db.Column("group_id", db.String, db.ForeignKey("group.id")),
)
