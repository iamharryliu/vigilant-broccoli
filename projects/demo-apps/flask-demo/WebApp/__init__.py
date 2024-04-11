from flask import Flask
from WebApp.config import AppConfig
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_mail import Mail


db = SQLAlchemy()
mail = Mail()
bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.login_view = "users.login"
login_manager.login_message_category = "info"


def create_app():
    app = Flask(__name__)
    # app.url_map.strict_slashes = False
    app.config.from_object(AppConfig)

    # Initialize Dependencies
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)

    # Add Blurprints
    from WebApp.main.routes import main

    app.register_blueprint(main)
    from WebApp.errors.handlers import errors

    app.register_blueprint(errors)
    return app
