from flask import request, Blueprint, jsonify
from App.models import User
from App.password import PasswordService
from App.database import db_session
from App.exceptions import BadRequestException, EXCEPTION_CODES

blueprint = Blueprint("users_create_blueprint", __name__)


@blueprint.route("register", methods=["POST"])
def register():
    data = request.get_json()
    if not all(key in data for key in ["username", "email", "password"]):
        raise BadRequestException(code=EXCEPTION_CODES.INSUFFICIENT_DATA)
    username = data["username"]
    email = data["email"]
    password = data["password"]
    if (
        User.query.filter_by(username=username).first()
        or User.query.filter_by(email=email).first()
    ):
        raise BadRequestException(code=EXCEPTION_CODES.EXISTING_RESOURCE)
    user = User(username, email, PasswordService.hash_password(password))
    db_session.add(user)
    db_session.commit()
    return jsonify({})
