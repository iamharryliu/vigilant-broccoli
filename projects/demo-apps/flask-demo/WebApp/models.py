from dataclasses import dataclass
from WebApp import db
import uuid
from flask_login import UserMixin


@dataclass
class User(db.Model, UserMixin):
    id = db.Column(db.String, default=lambda: uuid.uuid4().hex, primary_key=True)
    username: str = db.Column(db.String(120), unique=True, nullable=False)
    email: str = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
