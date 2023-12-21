from flask import Flask
from App.config import APP_CONFIG
from App.users.routes import (
    users_create_blueprint,
    users_update_blueprint,
    users_session_blueprint,
    users_follow_blueprint,
)
from App.errors.handlers import errors_blueprint
from App.database import db_session, init_db


def create_app():
    app = Flask(__name__)
    app.config.from_object(APP_CONFIG)

    app.register_blueprint(users_create_blueprint, url_prefix="/users")
    app.register_blueprint(users_update_blueprint, url_prefix="/users")
    app.register_blueprint(users_session_blueprint, url_prefix="/users")
    app.register_blueprint(users_follow_blueprint, url_prefix="/users")

    app.register_blueprint(errors_blueprint)

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()

    init_db()

    return app
