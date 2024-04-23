import os
from flask import Flask
from flask_mail import Mail
from App.config import DIT_CONFIG


DATABASE_URL = os.environ.get("GTA_UPDATE_ALERTS_DB")
mail = Mail()


def create_app(config=DIT_CONFIG):
    # Initialize App
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object(config)

    # Initialize Dependencies
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
