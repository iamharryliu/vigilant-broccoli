from flask import request, Blueprint, abort, jsonify
from App.models import User
from App.database import db_session

users_blueprint = Blueprint("users_blueprint", __name__)


@users_blueprint.route("register", methods=["POST"])
def register():
    data = request.get_json()
    if not all(key in data for key in ["username", "email", "password"]):
        abort(400)
    username = data["username"]
    email = data["email"]
    password = data["password"]
    try:
        user = User(username, email, password)
        db_session.add(user)
        db_session.commit()
    except:
        abort(500)
    else:
        return jsonify({})


@users_blueprint.route("login", methods=["POST"])
def login():
    return jsonify({})


@users_blueprint.route("logout", methods=["POST"])
def logout():
    return jsonify({})
