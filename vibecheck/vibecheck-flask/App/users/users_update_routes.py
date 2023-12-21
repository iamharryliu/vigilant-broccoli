from flask import request, Blueprint, jsonify, session
from App.models import User
from App.database import db_session

blueprint = Blueprint("users_update_blueprint", __name__)


@blueprint.route("update_username", methods=["POST"])
def update_username():
    data = request.get_json()
    username = data["username"]
    current_user = User.query.one()
    current_user.username = username
    db_session.commit()
    return jsonify({})


@blueprint.route("update_email", methods=["POST"])
def update_email():
    data = request.get_json()
    email = data["email"]
    current_user = User.query.one()
    current_user.email = email
    db_session.commit()
    return jsonify({})


@blueprint.route("update_password", methods=["POST"])
def update_password():
    data = request.get_json()
    password = data["password"]
    current_user = User.query.one()
    current_user.password = password
    db_session.commit()
    return jsonify({})
