from flask import Flask
from WebApp.config import Config
from WebApp.main.routes import main


def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object(Config)
    app.register_blueprint(main)

    return app
