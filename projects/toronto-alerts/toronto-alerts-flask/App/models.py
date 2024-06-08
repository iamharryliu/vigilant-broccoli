from App import db


class Subscription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    districts = db.Column(db.String)
    keywords = db.Column(db.String)
    confirmed_email = db.Column(db.Boolean, default=False)
