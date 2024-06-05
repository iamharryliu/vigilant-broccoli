from flask import request, Blueprint
from App import db, bcrypt
from App.models import User
from App.exceptions import BadRequestException, EXCEPTION_CODE

blueprint = Blueprint("users_create_blueprint", __name__, url_prefix="/api/users")


@blueprint.route("register", methods=["POST"])
def register():
    data = request.get_json()
    if not all(key in data for key in ["username", "email", "password"]):
        raise BadRequestException(code=EXCEPTION_CODE.INSUFFICIENT_DATA)
    username = data["username"]
    email = data["email"]
    password = data["password"]
    if (
        User.query.filter_by(username=username).first()
        or User.query.filter_by(email=email).first()
    ):
        raise BadRequestException(code=EXCEPTION_CODE.EXISTING_RESOURCE)

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return {}
