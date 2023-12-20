from sqlalchemy import Column, Integer, String
from App.database import Base
from App.config import USER_CONFIG


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(USER_CONFIG.MAX_USERNAME_LENGTH), unique=True)
    email = Column(String(USER_CONFIG.MAX_EMAIL_LENGTH), unique=True)
    password = Column(String(USER_CONFIG.MAX_PASSWORD_LENGTH))

    def __init__(self, username=None, email=None, password=None):
        self.username = username
        self.email = email
        self.password = password

    def __repr__(self):
        return f"<User {self.username!r}>"
