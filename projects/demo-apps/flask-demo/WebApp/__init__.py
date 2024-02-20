from flask import Flask
from WebApp.config import AppConfig
from WebApp.main.routes import main
from WebApp.errors.handlers import errors


def create_app():
    app = Flask(__name__)
    app.config.from_object(AppConfig)
    app.register_blueprint(main)
    app.register_blueprint(errors)
    return app
