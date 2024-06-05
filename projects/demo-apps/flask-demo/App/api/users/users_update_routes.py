from flask import request, Blueprint, jsonify
from App.models import User
from App import db

blueprint = Blueprint("users_update_blueprint", __name__)


@blueprint.route("update_username", methods=["POST"])
def update_username():
    data = request.get_json()
    username = data["username"]
    current_user = User.query.one()
    current_user.username = username
    db.session.commit()
    return jsonify({})


@blueprint.route("update_email", methods=["POST"])
def update_email():
    data = request.get_json()
    email = data["email"]
    current_user = User.query.one()
    current_user.email = email
    db.session.commit()
    return jsonify({})


@blueprint.route("update_password", methods=["POST"])
def update_password():
    data = request.get_json()
    password = data["password"]
    current_user = User.query.one()
    current_user.password = password
    db.session.commit()
    return jsonify({})
