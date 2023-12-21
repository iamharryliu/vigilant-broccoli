from flask import request, Blueprint, abort, jsonify, session
from App.models import User

blueprint = Blueprint("users_blueprint", __name__)


@blueprint.route("login", methods=["POST"])
def login():
    data = request.get_json()
    if not all(key in data for key in ["identification", "password"]):
        abort(400)
    user = (
        User.query.filter_by(username=data["identification"]).first()
        or User.query.filter_by(email=data["identification"]).first()
    )
    session["user"] = {"username": user.username}
    return jsonify({})


@blueprint.route("logout", methods=["POST"])
def logout():
    session["user"] = None
    return jsonify({})


@blueprint.route("get_login_status", methods=["GET"])
def get_login_status():
    return jsonify({"status": session["user"] is not None})
