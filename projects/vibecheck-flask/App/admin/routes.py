from functools import wraps
from flask import abort
from flask_login import current_user
from flask_cors import cross_origin
from App import db
from App.constants import ADMIN_ENDPOINTS, BLUEPRINTS, HTTP_METHODS
from App.models import User, Outfit, Tag

admin_blueprint = BLUEPRINTS.ADMIN_BLUEPRINT


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.is_authenticated and current_user.role == "ADMIN":
            return f(*args, **kwargs)
        return abort(403)

    return decorated_function


@admin_blueprint.route(ADMIN_ENDPOINTS.USER.GET_ALL_USERS)
@admin_required
@cross_origin(supports_credentials=True)
def get_all_users():
    users = [user.get_detail_view_response() for user in User.query.all()]
    return {"users": users}


@admin_blueprint.route(f"{ADMIN_ENDPOINTS.USER.GET_USER_DETAIL}/<int:user_id>")
@admin_required
@cross_origin(supports_credentials=True)
def get_user(user_id):
    user = User.query.get(user_id)
    return user.get_admin_detail_view_response()


@admin_blueprint.route(
    f"{ADMIN_ENDPOINTS.USER.DELETE_USER}/<int:user_id>", methods=[HTTP_METHODS.DELETE]
)
@cross_origin(supports_credentials=True)
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if current_user.username == "harry":
        db.session.delete(user)
        db.session.commit()
    return {"success": True}


@admin_blueprint.route(ADMIN_ENDPOINTS.OUTFIT.GET_ALL_OUTFITS)
@admin_required
@cross_origin(supports_credentials=True)
def get_all_outfits():
    outfits = [outfit.get_admin_list_view_response() for outfit in Outfit.query.all()]
    return {"outfits": outfits}


@admin_blueprint.route(f"{ADMIN_ENDPOINTS.OUTFIT.GET_OUTFIT}/<int:outfit_id>")
@admin_required
@cross_origin(supports_credentials=True)
def get_outfit(outfit_id):
    outfit = User.query.get(outfit_id)
    return {"outfit": outfit.get_detail_view_response()}


@admin_blueprint.route(
    f"{ADMIN_ENDPOINTS.OUTFIT.DELETE_OUTFIT}/<int:outfit_id>",
    methods=[HTTP_METHODS.DELETE],
)
@cross_origin(supports_credentials=True)
@admin_required
def delete_outfit(outfit_id):
    outfit = Outfit.query.get(outfit_id)
    db.session.delete(outfit)
    db.session.commit()
    return {"success": True}


@admin_blueprint.route(ADMIN_ENDPOINTS.GET_TAGS)
@admin_required
@cross_origin(supports_credentials=True)
def get_tags():
    tags = [tag.as_json() for tag in Tag.query.all()]
    return {"tags": tags}
