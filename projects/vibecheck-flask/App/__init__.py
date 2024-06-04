from App.config import DIT_CONFIG
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_mail import Mail

db = SQLAlchemy()
bcrypt = Bcrypt()
mail = Mail()
login_manager = LoginManager()


def create_app(config=DIT_CONFIG):
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object(config)

    db.init_app(app)
    with app.app_context():
        db.create_all()

    bcrypt.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)

    @app.route("/")
    def index():
        return "vibecheck-flask"

    from App.user.routes import users_blueprint
    from App.image.routes import images_blueprint
    from App.outfit.routes import outfits_blueprint
    from App.weather.routes import weather_blueprint
    from App.errors.handlers import errors
    from App.admin.routes import admin_blueprint

    app.register_blueprint(users_blueprint, url_prefix=f"/{users_blueprint.name}")
    app.register_blueprint(images_blueprint, url_prefix=f"/{images_blueprint.name}")
    app.register_blueprint(outfits_blueprint, url_prefix=f"/{outfits_blueprint.name}")
    app.register_blueprint(weather_blueprint, url_prefix=f"/{weather_blueprint.name}")
    app.register_blueprint(admin_blueprint, url_prefix=f"/{admin_blueprint.name}")
    app.register_blueprint(errors)

    return app
