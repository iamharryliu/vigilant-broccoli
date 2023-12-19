from flask import Flask
from App.users.routes import users_blueprint
from App.errors.handlers import errors_blueprint


def create_app():
    app = Flask(__name__)
    app.register_blueprint(users_blueprint, url_prefix="/users")
    app.register_blueprint(errors_blueprint)

    return app
