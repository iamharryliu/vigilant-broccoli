from App.database import engine
from App.models import User


def drop_db():
    User.__table__.drop(engine)
