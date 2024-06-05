from flask import Flask, jsonify
from App.config import DIT_CONFIG
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_mail import Mail
from App.exceptions import BadRequestException, UnauthorizedException


db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.login_view = "users.login"
login_manager.login_message_category = "info"
mail = Mail()


def create_app(config=DIT_CONFIG):
    # Initialize App
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object(config)

    # Initialize Dependencies
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)

    # Import Blueprints
    from App.main.routes import main_blueprint
    from App.users.routes import users_blueprint
    from App.errors.handlers import errors_blueprint
    from App.api.users.routes import api_users_create_blueprint
    from App.api.users.routes import api_users_session_blueprint
    from App.api.users.routes import api_users_update_blueprint

    # UI Blueprints
    app.register_blueprint(main_blueprint)
    app.register_blueprint(users_blueprint)
    app.register_blueprint(errors_blueprint)
    # API Blueprints.
    app.register_blueprint(api_users_create_blueprint)
    app.register_blueprint(api_users_session_blueprint)
    app.register_blueprint(api_users_update_blueprint)

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
    def teardown_function(exception=None):
        print("Teardown function.")

    return app
