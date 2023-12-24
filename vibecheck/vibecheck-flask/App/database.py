from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, declarative_base

engine = create_engine("sqlite:///test.db")
db_session = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)
Base = declarative_base()
Base.query = db_session.query_property()


class DatabaseManager:
    @staticmethod
    def init_db():
        import App.users.models

        Base.metadata.create_all(bind=engine)

    @staticmethod
    def drop_db():
        Base.metadata.drop_all(bind=engine)
