from datetime import datetime
from flask import current_app
from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer as Serializer
from App import db, login_manager
from App.config import USER_CONFIG


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User_followers(db.Model):
    follower_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(
        db.String(USER_CONFIG.MAX_USERNAME_LENGTH), nullable=False, unique=True
    )
    email = db.Column(db.String(USER_CONFIG.MAX_EMAIL_LENGTH), unique=True)
    password = db.Column(db.String(USER_CONFIG.MAX_PASSWORD_LENGTH), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    image_file = db.Column(db.String)
    description = db.Column(db.String(USER_CONFIG.MAX_DESCRIPTION_LENGTH))
    default_latitude = db.Column(db.Float)
    default_longitude = db.Column(db.Float)
    default_city = db.Column(db.String)
    preferred_temperature_scale = db.Column(db.String, default="CELSIUS")
    default_country = db.Column(db.String)
    role = db.Column(db.String, default="REGULAR", nullable=False)

    outfits = db.relationship(
        "Outfit", backref="stylist", cascade="all,delete", lazy=True
    )
    filters = db.relationship(
        "Filter", backref="owner", cascade="all,delete", lazy=True
    )
    following = db.relationship(
        "User",
        secondary="user_followers",
        primaryjoin=(User_followers.followed_id == id),
        secondaryjoin=(User_followers.follower_id == id),
        backref="followers",
        lazy=True,
    )
    outfits_liked = db.relationship(
        "Outfit",
        secondary="outfit_likes",
        backref="likers",
        lazy=True,
    )
    outfits_swiped = db.relationship(
        "Outfit",
        secondary="outfit_swipes",
        backref="swipers",
        lazy=True,
    )

    # TODO: look into expire time
    # def get_reset_password_token(self, expires_sec=1800):
    #     serializer = Serializer(current_app.config["SECRET_KEY"], expires_sec)
    #     return serializer.dumps({"user_id": self.id}).decode("utf-8")
    def get_reset_password_token(self, expires_sec=1800):
        serializer = Serializer(current_app.config["SECRET_KEY"])
        return serializer.dumps({"user_id": self.id})

    @staticmethod
    def verify_reset_token(token):
        serializer = Serializer(current_app.config["SECRET_KEY"])
        try:
            user_id = serializer.loads(token)["user_id"]
        except:
            return None
        return User.query.get(user_id)

    def get_current_user_response(self):
        return {
            **self.get_detail_view_response(),
            "role": self.role,
            "preferredTemperatureScale": self.preferred_temperature_scale,
            "filters": [filter.as_json() for filter in self.filters],
            "defaultLocation": self.get_default_location_response(),
            "outfits": [
                outfit.get_response_for_user_response() for outfit in self.outfits
            ],
            "likedOutfits": [
                outfit.get_detail_view_response() for outfit in self.outfits_liked
            ],
        }

    def get_detail_view_response(self):
        return {
            "id": self.id,
            **self.get_username_and_image_response(),
            "description": self.description,
            "numberOfOutfits": len(self.outfits),
            "following": [
                following.get_username_and_image_response()
                for following in self.following
            ],
            "followers": [
                follower.get_username_and_image_response()
                for follower in self.followers
            ],
        }

    def get_default_location_response(self):
        return (
            {
                "latitude": self.default_latitude,
                "longitude": self.default_longitude,
                "city": self.default_city,
                "country": self.default_country,
            }
            if self.default_latitude
            else None
        )

    def get_username_and_image_response(self):
        return {
            "username": self.username,
            "imageFile": self.image_file,
        }

    def get_admin_detail_view_response(self):
        return {
            **self.get_detail_view_response(),
            "role": self.role,
        }
