import os
from flask import Flask
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from App.config import DIT_CONFIG
from google_recaptcha import ReCaptcha


db = SQLAlchemy()
mail = Mail()
recaptcha = None


def create_app(config=DIT_CONFIG):
    # Initialize App
    app = Flask(__name__)

    # TODO: fix this later
    global recaptcha
    recaptcha = ReCaptcha(
        app=app,
        site_key=os.environ.get("TORONTO_ALERTS_RECAPTCHA_SITE_KEY"),
        site_secret=os.environ.get("TORONTO_ALERTS_RECAPTCHA_SECRET_KEY"),
    )
    app.url_map.strict_slashes = False
    app.config.from_object(config)

    # Initialize Dependencies
    db.init_app(app)
    mail.init_app(app)

    # Import Blueprints
    from App.main.main_routes import main_blueprint
    from App.weather.weather_routes import weather_blueprint
    from App.ttc.ttc_routes import ttc_blueprint
    from App.tps.tps_routes import tps_blueprint

    # Add Blurprints
    app.register_blueprint(main_blueprint)
    app.register_blueprint(weather_blueprint)
    app.register_blueprint(ttc_blueprint)
    app.register_blueprint(tps_blueprint)

    return app
