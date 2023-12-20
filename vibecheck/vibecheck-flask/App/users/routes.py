from flask import request, Blueprint, abort, jsonify, session
from App.models import User
from App.database import db_session

# TODO sepearate user handling and user CRUD?
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
    session["user"] = {}
    return jsonify({})


@users_blueprint.route("logout", methods=["POST"])
def logout():
    session["user"] = None
    return jsonify({})


@users_blueprint.route("get_login_status", methods=["GET"])
def get_login_status():
    return jsonify({"status": session["user"] is not None})
