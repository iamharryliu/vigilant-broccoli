from flask import request, Blueprint, jsonify, session
from flask_cors import cross_origin
import bcrypt
from App.models import User
from App.config import EXCEPTION_CODES
from App.exceptions import BadRequestException
from App.exceptions import UnauthorizedException

blueprint = Blueprint("users_blueprint", __name__)


@blueprint.route("login", methods=["POST"])
@cross_origin(supports_credentials=True)
def login():
    data = request.get_json()
    if not all(key in data for key in ["identification", "password"]):
        raise BadRequestException(EXCEPTION_CODES.INSUFFICIENT_DATA)
    user = (
        User.query.filter_by(username=data["identification"]).first()
        or User.query.filter_by(email=data["identification"]).first()
    )
    password = data["password"]
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user.password):
        raise UnauthorizedException()
    session["user"] = {"username": user.username}
    return jsonify({})


@blueprint.route("logout", methods=["POST"])
@cross_origin(supports_credentials=True)
def logout():
    session["user"] = None
    return jsonify({})


@blueprint.route("get_login_status", methods=["GET"])
@cross_origin(supports_credentials=True)
def get_login_status():
    print(session["user"])
    return jsonify({"status": session["user"] is not None})
