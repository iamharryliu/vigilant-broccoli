from App import db


class Subscription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    districts = db.Column(db.String, nullable=False)
    keywords = db.Column(db.String, nullable=False)
    confirmed_email = db.Column(db.Boolean, default=False)
