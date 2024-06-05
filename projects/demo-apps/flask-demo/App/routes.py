from flask import Blueprint
from App.main.routes import main_blueprint
from App.users.routes import users_blueprint
from App.utility.routes import utility_blueprint

ui_blueprint = Blueprint("ui", __name__)
ui_blueprint.register_blueprint(main_blueprint)
ui_blueprint.register_blueprint(users_blueprint)
ui_blueprint.register_blueprint(utility_blueprint)
