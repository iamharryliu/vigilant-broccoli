from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_mail import Mail
from flask_admin import Admin
from WebApp.admin import MyAdminIndexView, ModelView

db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.login_view = "users.login"
login_manager.login_message_category = "info"
mail = Mail()
admin = Admin(index_view=MyAdminIndexView())

from WebApp.models import *


def create_app(Config):
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    admin.init_app(app)
    with app.app_context():
        db.create_all()

    admin.add_view(ModelView(User, db.session))

    from WebApp.main.routes import main_blueprint
    from WebApp.users.routes import users_blueprint
    from WebApp.posts.routes import posts_blueprint
    from WebApp.store.routes import store_blueprint
    from WebApp.errors.handlers import errors

    app.register_blueprint(main_blueprint)
    app.register_blueprint(users_blueprint)
    app.register_blueprint(posts_blueprint)
    app.register_blueprint(store_blueprint)
    app.register_blueprint(errors)

    return app
