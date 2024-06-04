from App import db
from App.config import OUTFIT_CONFIG
from App.utils import dt_to_str
from datetime import datetime


class Outfit_tag(db.Model):
    tag_name = db.Column(db.String, db.ForeignKey("tag.name"), primary_key=True)
    outfit_id = db.Column(db.Integer, db.ForeignKey("outfit.id"), primary_key=True)


class Outfit_likes(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    outfit_id = db.Column(db.Integer, db.ForeignKey("outfit.id"), primary_key=True)


class Outfit_swipes(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    outfit_id = db.Column(db.Integer, db.ForeignKey("outfit.id"), primary_key=True)


class Outfit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.String(OUTFIT_CONFIG.MAX_DESCRIPTION_LENGTH))
    date_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    images = db.relationship("Image", backref="outfit", cascade="all,delete", lazy=True)

    # todo: makes roles: MASCULINE,FEMININE,UNISEX
    gender = db.Column(db.String, nullable=False)
    # todo: makes roles: WINTER,SPRING,SUMMER,FALL
    season = db.Column(db.String, nullable=False)
    temperature = db.Column(db.Float, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    def get_admin_list_view_response(self):
        return {
            "id": self.id,
            "name": self.name,
            "dateCreated": dt_to_str(self.date_created),
            "user": self.stylist.get_username_and_image_response(),
            "number_of_followers": len(self.likers),
        }

    def get_detail_view_response(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "dateCreated": dt_to_str(self.date_created),
            "images": [image.as_json for image in self.images],
            "gender": self.gender,
            "season": self.season,
            "temperature": self.temperature,
            "tags": [tag.name for tag in self.tags],
            "user": self.stylist.get_username_and_image_response(),
            "number_of_followers": len(self.likers),
        }

    def get_card_view_response(self):
        return {
            "id": self.id,
            "name": self.name,
            "images": [image.as_json for image in self.images],
        }

    def list_view_response(self):
        return {
            "id": self.id,
            "image": self.images[0].as_json,
        }

    def get_response_for_user_response(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "dateCreated": dt_to_str(self.date_created),
            "images": [image.as_json for image in self.images],
            "gender": self.gender,
            "season": self.season,
            "tags": [tag.name for tag in self.tags],
            "number_of_followers": len(self.likers),
        }
