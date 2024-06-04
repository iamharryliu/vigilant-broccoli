import re
from flask import request, current_app
from flask_login import login_user, current_user, logout_user, login_required
from flask_mail import Message
from flask_cors import cross_origin
from App import db, bcrypt, mail
from App.constants import BLUEPRINTS, HTTP_METHODS, USER_ENDPOINTS
from App.models import User, Filter
from App.config import APP_CONFIG, ENVIRONMENT_TYPE, USER_CONFIG
from App.image.utils import save_picture

users_blueprint = BLUEPRINTS.USERS_BLUEPRINT


@users_blueprint.route(USER_ENDPOINTS.REGISTER, methods=[HTTP_METHODS.POST])
@cross_origin(supports_credentials=True)
def register_route():
    data = request.get_json()
    username = data["username"].lower()
    if len(username) > USER_CONFIG.MAX_USERNAME_LENGTH:
        return {"success": False}
    email = data["email"]
    password = data["password"]
    if len(password) > USER_CONFIG.MAX_PASSWORD_LENGTH:
        return {"success": False}
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, email=email, password=hashed_password)
    _filter = Filter(
        owner=user,
        is_default=True,
    )
    try:
        db.session.add(user)
        db.session.add(_filter)
        db.session.commit()
        login_user(user, remember=True)
    except:
        message = "An account with this username/email already exists."
        return {"success": False, "message": message}
    else:
        return {"success": True, "user": user.get_current_user_response()}


@users_blueprint.route(USER_ENDPOINTS.LOGIN_STATUS, methods=[HTTP_METHODS.GET])
@cross_origin(supports_credentials=True)
def get_login_status_route():
    if current_user.is_authenticated:
        status = True
        user = current_user.get_current_user_response()
    else:
        status = False
        user = None
    return {"status": status, "user": user}


@users_blueprint.route(USER_ENDPOINTS.LOGIN, methods=[HTTP_METHODS.POST])
@cross_origin(supports_credentials=True)
def login_route():
    data = request.get_json()
    identification = data["identification"].lower()
    password = data["password"]
    if not re.match(r"[^@]+@[^@]+\.[^@]+", identification):
        user = User.query.filter_by(username=identification).first()
    else:
        user = User.query.filter_by(email=identification).first()
    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user, remember=True)
        user = current_user.get_current_user_response()
        return {"success": True, "user": user}
    else:
        return {"success": False}


@users_blueprint.route(USER_ENDPOINTS.LOGOUT, methods=[HTTP_METHODS.POST])
@cross_origin(supports_credentials=True)
def logout_route():
    logout_user()
    return {"success": True}


@users_blueprint.route(USER_ENDPOINTS.FOLLOW, methods=[HTTP_METHODS.PUT])
@login_required
@cross_origin(supports_credentials=True)
def follow_user():
    data = request.get_json()
    username = data["username"]
    user = User.query.filter_by(username=username).first()
    if current_user == user:
        return {"success": False}
    following = current_user.following
    following.append(user)
    db.session.commit()
    return {
        "success": True,
        "followedUser": user.get_detail_view_response(),
    }


@users_blueprint.route(USER_ENDPOINTS.UNFOLLOW, methods=[HTTP_METHODS.PUT])
@login_required
@cross_origin(supports_credentials=True)
def unfollow_user():
    data = request.get_json()
    username = data["username"]
    user = User.query.filter_by(username=username).first()
    following = current_user.following
    if user in following:
        following.remove(user)
    db.session.commit()
    return {
        "success": True,
        "following": [
            following.get_username_and_image_response()
            for following in current_user.following
        ],
        "unfollowedUser": user.get_detail_view_response(),
    }


@users_blueprint.route(
    f"{USER_ENDPOINTS.REMOVE_FOLLOWER}/<string:username>", methods=[HTTP_METHODS.PUT]
)
@login_required
@cross_origin(supports_credentials=True)
def remove_follower(username):
    user = User.query.filter_by(username=username).first()
    followers = current_user.followers
    if user in followers:
        followers.remove(user)
    db.session.commit()
    return {
        "success": True,
    }


@users_blueprint.route(USER_ENDPOINTS.GET_USER, methods=[HTTP_METHODS.GET])
@cross_origin(supports_credentials=True)
def get_user():
    username = request.args.get("username")
    user = User.query.filter_by(username=username).first()
    success = True if user else False
    return {"success": success, "user": user.get_detail_view_response()}


@users_blueprint.route(USER_ENDPOINTS.DELETE_ACCOUNT, methods=[HTTP_METHODS.DELETE])
@login_required
@cross_origin(supports_credentials=True)
def delete_user():
    user = User.query.get(current_user.id)
    db.session.delete(user)
    db.session.commit()
    return {"success": True}


@users_blueprint.route(USER_ENDPOINTS.UPDATE_PROFILE_IMAGE, methods=[HTTP_METHODS.POST])
@login_required
@cross_origin(supports_credentials=True)
def update_user_image():
    pictures = request.files.getlist("pictures")
    picture_file = save_picture(
        pictures[0], location="uploads", image_size=APP_CONFIG.USER_THUMBNAIL_SIZE
    )
    current_user.image_file = picture_file
    db.session.commit()
    return {
        "success": True,
        "imageFile": current_user.image_file,
    }


# TODO: use identification instead of just email and update unit tests.
@users_blueprint.route(
    USER_ENDPOINTS.PASSWORD_RESET.REQUEST, methods=[HTTP_METHODS.POST]
)
@cross_origin(supports_credentials=True)
def reset_password_request():
    data = request.get_json()
    email = data["email"]
    user = User.query.filter_by(email=email).first()
    if user:
        # TODO: find better way to handle this
        if current_app.config["ENVIRONMENT"] != ENVIRONMENT_TYPE.TEST:
            token = user.get_reset_password_token()
            msg = Message("Password Reset Request", recipients=[user.email])
            msg.body = f"""To reset your password, visit the following link:
    {current_app.config["FRONTEND_APPLICATION_URL"]}/reset_password/{token}
    If you did not make this request then simply ignore this email.
    """
            mail.send(msg)
        success = True
    else:
        success = False
    return {"success": success}


@users_blueprint.route(
    f"{USER_ENDPOINTS.PASSWORD_RESET.VALIDATE_TOKEN}/<token>",
    methods=[HTTP_METHODS.GET],
)
@cross_origin(supports_credentials=True)
def check_for_valid_password_reset_token(token):
    user = User.verify_reset_token(token)
    success = bool(user)
    return {"success": success}


@users_blueprint.route(
    f"{USER_ENDPOINTS.PASSWORD_RESET.SET_PASSWORD}/<token>", methods=[HTTP_METHODS.POST]
)
@cross_origin(supports_credentials=True)
def set_new_password_route(token):
    user = User.verify_reset_token(token)
    if user:
        data = request.get_json()
        password = data["password"]
        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        user.password = hashed_password
        db.session.commit()
        login_user(user, remember=True)
        return {"success": True, "user": user.get_current_user_response()}
    return {"success": False}


@users_blueprint.route(USER_ENDPOINTS.CHANGE_PASSWORD, methods=[HTTP_METHODS.POST])
@login_required
@cross_origin(supports_credentials=True)
def change_password_route():
    data = request.get_json()
    current_password = data["currentPassword"]
    new_password = data["newPassword"]
    if bcrypt.check_password_hash(current_user.password, current_password):
        hashed_password = bcrypt.generate_password_hash(new_password).decode("utf-8")
        current_user.password = hashed_password
        db.session.commit()
        success = True
    else:
        success = False
    return {"success": success}


@users_blueprint.route(USER_ENDPOINTS.CHANGE_USERNAME, methods=[HTTP_METHODS.PUT])
@login_required
@cross_origin(supports_credentials=True)
def change_username_route():
    data = request.get_json()
    username = data["username"]
    try:
        current_user.username = username
        db.session.commit()
        return {"success": True}
    except:
        return {"success": False}


@users_blueprint.route(USER_ENDPOINTS.CHANGE_EMAIL, methods=[HTTP_METHODS.PUT])
@login_required
@cross_origin(supports_credentials=True)
def change_email_route():
    data = request.get_json()
    email = data["email"]
    try:
        current_user.email = email
        db.session.commit()
        return {"success": True}
    except:
        return {"success": False}


@users_blueprint.route(
    f"{USER_ENDPOINTS.SEARCH_USERS}/<string:search_string>", methods=[HTTP_METHODS.GET]
)
@login_required
@cross_origin(supports_credentials=True)
def search_users_route(search_string):
    search = f"%{search_string}%"
    users = User.query.filter(User.username.like(search)).limit(20).all()
    users = [user.get_username_and_image_response() for user in users]
    return {"success": True, "users": users}


@users_blueprint.route(USER_ENDPOINTS.SET_DEFAULT_LOCATION, methods=[HTTP_METHODS.POST])
@login_required
@cross_origin(supports_credentials=True)
def set_default_location():
    data = request.get_json()
    current_user.default_latitude = data["latitude"]
    current_user.default_longitude = data["longitude"]
    current_user.default_city = data["city"]
    current_user.default_country = data["country"]
    db.session.commit()
    return {
        "success": True,
        "defaultLocation": current_user.get_default_location_response(),
    }
