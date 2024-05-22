from flask import Flask
from App.config import DIT_CONFIG
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_mail import Mail


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

    # Add Blurprints
    app.register_blueprint(main_blueprint)
    app.register_blueprint(users_blueprint)
    app.register_blueprint(errors_blueprint)
    return app
