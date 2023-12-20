from sqlalchemy import Column, Integer, String, Table, ForeignKey
from App.database import Base
from App.config import USER_CONFIG

from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(USER_CONFIG.MAX_USERNAME_LENGTH), unique=True)
    email = Column(String(USER_CONFIG.MAX_EMAIL_LENGTH), unique=True)
    password = Column(String(USER_CONFIG.MAX_PASSWORD_LENGTH))

    following = relationship(
        "User",
        lambda: user_following,
        primaryjoin=lambda: User.id == user_following.c.user_id,
        secondaryjoin=lambda: User.id == user_following.c.following_id,
        backref="followers",
        cascade="all,delete",
    )

    def __init__(self, username=None, email=None, password=None):
        self.username = username
        self.email = email
        self.password = password

    def __repr__(self):
        return f"<User {self.username!r}>"


user_following = Table(
    "user_following",
    Base.metadata,
    Column("user_id", Integer, ForeignKey(User.id), primary_key=True),
    Column("following_id", Integer, ForeignKey(User.id), primary_key=True),
)
