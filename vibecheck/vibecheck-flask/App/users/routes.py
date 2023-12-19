from flask import jsonify, Blueprint

users_blueprint = Blueprint("users_blueprint", __name__)


@users_blueprint.route("register", methods=["POST"])
def register():
    return jsonify({"message": "message"})


@users_blueprint.route("login", methods=["POST"])
def login():
    return jsonify({"message": "message"})


@users_blueprint.route("logout", methods=["POST"])
def logout():
    return jsonify({"message": "message"})
