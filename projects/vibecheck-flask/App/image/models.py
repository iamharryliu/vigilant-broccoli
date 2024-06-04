from App import db
from datetime import datetime


class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_file = db.Column(db.String, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    outfit_id = db.Column(db.Integer, db.ForeignKey("outfit.id"))

    @property
    def as_json(self):
        return self.image_file

    def __repr__(self):
        return self.image_file
