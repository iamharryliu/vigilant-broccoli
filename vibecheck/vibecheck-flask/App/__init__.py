from flask import Flask


def create_app():
    app = Flask(__name__)

    from App.users.routes import users_blueprint
    from App.errors.handlers import errors_blueprint

    app.register_blueprint(users_blueprint, url_prefix="/users")
    app.register_blueprint(errors_blueprint)

    from App.database import db_session, init_db

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()

    init_db()

    return app
