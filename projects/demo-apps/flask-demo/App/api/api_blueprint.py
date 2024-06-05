from flask import Blueprint
from App.api.users.users_create_routes import blueprint as api_users_create_blueprint
from App.api.users.users_session_routes import blueprint as api_users_session_blueprint
from App.api.users.users_update_routes import blueprint as api_users_update_blueprint
from App.api.users.users_follow_routes import blueprint as api_users_follow_blueprint

api_blueprint = Blueprint("api", __name__, url_prefix="/api")

api_blueprint.register_blueprint(api_users_create_blueprint)
api_blueprint.register_blueprint(api_users_session_blueprint)
api_blueprint.register_blueprint(api_users_update_blueprint)
api_blueprint.register_blueprint(api_users_follow_blueprint)
