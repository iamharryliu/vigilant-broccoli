from flask import Flask, jsonify
from flask_login import LoginManager
from flask_cors import CORS
from App.config import APP_CONFIG
from App.database import db_session, DatabaseManager
from App.exceptions import BadRequestException, UnauthorizedException


login_manager = LoginManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(APP_CONFIG)
    CORS(app)
    login_manager.init_app(app)

    from App.users.routes import (
        users_create_blueprint,
        users_update_blueprint,
        users_session_blueprint,
        users_follow_blueprint,
    )

    app.register_blueprint(users_create_blueprint, url_prefix="/users")
    app.register_blueprint(users_update_blueprint, url_prefix="/users")
    app.register_blueprint(users_session_blueprint, url_prefix="/users")
    app.register_blueprint(users_follow_blueprint, url_prefix="/users")

    from App.errors.handlers import errors_blueprint

    app.register_blueprint(errors_blueprint)

    @app.errorhandler(BadRequestException)
    def handle_bad_request(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(UnauthorizedException)
    def handle_unauthorized_request(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()

    DatabaseManager.init_db()

    return app
