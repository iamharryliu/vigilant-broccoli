from datetime import datetime, timedelta
from flask import request, abort, current_app
from flask_login import current_user, login_required
from flask_cors import cross_origin
from sqlalchemy import and_
from sqlalchemy.sql.expression import func
from App import db
from App.config import (
    APP_CONFIG,
    OUTFIT_CONFIG,
)
from App.constants import BLUEPRINTS, HTTP_METHODS, OUTFIT_ENDPOINTS
from App.models import User, Outfit, Outfit_likes, Image, Tag, Filter
from App.tag.utils import create_tags

outfits_blueprint = BLUEPRINTS.OUTFITS_BLUEPRINT


@outfits_blueprint.route(OUTFIT_ENDPOINTS.CREATE, methods=[HTTP_METHODS.POST])
@login_required
@cross_origin(supports_credentials=True)
def create_outfit():
    number_of_outfits_created_today = (
        Outfit.query.filter(Outfit.user_id == current_user.id)
        .filter(datetime.now() - Outfit.date_created <= timedelta(days=1))
        .count()
    )
    if number_of_outfits_created_today >= APP_CONFIG.DAILY_OUTFIT_UPLOAD_LIMIT:
        return {
            "error": (
                f"User cannot submit more than {APP_CONFIG.DAILY_OUTFIT_UPLOAD_LIMIT}"
                " outfits per day"
            ),
        }
    data = request.get_json()
    outfit = Outfit(
        stylist=current_user,
        name=data["name"],
        description=data["description"],
        season=data["season"],
        gender=data["gender"],
        temperature=data["temperature"],
    )
    tags = create_tags(data["description"])
    outfit.tags[:] = [Tag.query.filter_by(name=tag)[0] for tag in tags]
    for filename in data["filenames"]:
        image = Image.query.filter_by(image_file=filename)[0]
        outfit.images.append(image)
    db.session.add(outfit)
    db.session.commit()
    return {
        "outfit": outfit.get_detail_view_response(),
    }


@outfits_blueprint.route(
    OUTFIT_ENDPOINTS.GET_SWIPABLE_OUTFITS, methods=[HTTP_METHODS.GET]
)
@login_required
@cross_origin(supports_credentials=True)
def get_swipable_outfits():
    query = Outfit.query

    if current_app.config["FILTER_INTERACTED_CARDS"]:
        query = query.filter(Outfit.stylist != current_user)
        query = query.filter(~Outfit.likers.contains(current_user))
        query = query.filter(~Outfit.swipers.contains(current_user))

    gender = request.args.get("gender")
    if gender:
        query = query.filter(Outfit.gender.in_(gender.split(",")))

    season = request.args.get("season")
    if season:
        query = query.filter(Outfit.season.in_(season.split(",")))

    min_temperature = request.args.get("minTemperature")
    max_temperature = request.args.get("maxTemperature")
    if min_temperature and max_temperature:
        query = query.filter(
            and_(
                min_temperature <= Outfit.temperature,
                Outfit.temperature <= max_temperature,
            )
        )

    tags = request.args.get("tags")
    if tags:
        tags = tags.split(",")
        query = query.filter(Outfit.tags.any(Tag.name.in_(tags)))

    sort_by = request.args.get("sort_by")
    if sort_by == "top":
        query = (
            query.join(Outfit_likes).group_by(Outfit.id).order_by(func.count().desc())
        )
    if sort_by == "recent":
        query = query.order_by(Outfit.date_created.desc())
    if sort_by == "random":
        query = query.order_by(func.random())

    if APP_CONFIG.OUTFIT_QUERY_LIMIT:
        query = query.limit(APP_CONFIG.OUTFIT_QUERY_LIMIT)

    return {"outfits": [outfit.get_card_view_response() for outfit in query]}


@outfits_blueprint.route(
    f"{OUTFIT_ENDPOINTS.GET_OUTFIT_DETAILS}/<string:outfit_id>",
    methods=[HTTP_METHODS.GET],
)
@login_required
@cross_origin(supports_credentials=True)
def get_outfit(outfit_id):
    outfit = Outfit.query.get(outfit_id)
    return outfit.get_detail_view_response()


@login_required
@outfits_blueprint.route(OUTFIT_ENDPOINTS.UPDATE, methods=[HTTP_METHODS.PUT])
@cross_origin(supports_credentials=True)
def update_outfit():
    data = request.get_json()
    outfit_id = data["id"]
    outfit = Outfit.query.get(outfit_id)
    if outfit.stylist == current_user:
        outfit.gender = data["gender"]
        outfit.temperature = data["temperature"]
        outfit.season = data["season"]
        outfit.name = data["name"]
        outfit.description = data["description"]
        tags = create_tags(data["description"])
        outfit.tags[:] = [Tag.query.filter_by(name=tag)[0] for tag in tags]
        db.session.commit()
        outfit = outfit.get_detail_view_response()
    else:
        abort(401)
    return {
        "outfit": outfit,
    }


@outfits_blueprint.route(
    f"{OUTFIT_ENDPOINTS.DELETE}/<int:outfit_id>", methods=[HTTP_METHODS.DELETE]
)
@login_required
@cross_origin(supports_credentials=True)
def delete_outfit(outfit_id):
    outfit = Outfit.query.get(outfit_id)
    if outfit.stylist == current_user:
        db.session.delete(outfit)
        db.session.commit()
    return {}


@outfits_blueprint.route(OUTFIT_ENDPOINTS.LIKE, methods=[HTTP_METHODS.PUT])
@login_required
@cross_origin(supports_credentials=True)
def like_outfit():
    outfit_id = request.get_json()["id"]
    outfit = Outfit.query.get(outfit_id)
    current_user.outfits_liked.append(outfit)
    current_user.outfits_swiped.append(outfit)
    db.session.commit()
    return {}


@outfits_blueprint.route(OUTFIT_ENDPOINTS.SWIPE, methods=[HTTP_METHODS.PUT])
@login_required
@cross_origin(supports_credentials=True)
def swipe_outfit():
    outfit_id = request.get_json()["id"]
    outfit = Outfit.query.get(outfit_id)
    current_user.outfits_swiped.append(outfit)
    db.session.commit()
    return {}


@outfits_blueprint.route(OUTFIT_ENDPOINTS.UNLIKE, methods=[HTTP_METHODS.PUT])
@login_required
@cross_origin(supports_credentials=True)
def unlike_outfit():
    ids = request.get_json()["ids"]
    for outfit_id in ids:
        outfit = Outfit.query.get(outfit_id)
        if outfit in current_user.outfits_liked:
            current_user.outfits_liked.remove(outfit)
    db.session.commit()
    return {}


@outfits_blueprint.route(OUTFIT_ENDPOINTS.UPDATE_FILTER, methods=[HTTP_METHODS.PUT])
@login_required
@cross_origin(supports_credentials=True)
def update_filter():
    data = request.get_json()
    outfitFilter = Filter.query.get(data["filter"]["id"])
    if outfitFilter.owner == current_user:
        tags = data["filter"]["tags"]
        if len(tags) > OUTFIT_CONFIG.TAG_LIMIT:
            return {"error": "Description exceeds hashtag limit"}
        create_tags(tags=tags)
        for tag in tags:
            if not Tag.query.filter_by(name=tag).scalar():
                new_tag = Tag(name=tag)
                db.session.add(new_tag)
        outfitFilter.sort_by = data["filter"]["sortBy"]
        outfitFilter.gender = ",".join(data["filter"]["gender"])
        outfitFilter.tags[:] = [Tag.query.filter_by(name=tag)[0] for tag in tags]
        outfitFilter.use_location = data["filter"]["useLocation"]
        outfitFilter.min_temperature = data["filter"]["minTemperature"]
        outfitFilter.max_temperature = data["filter"]["maxTemperature"]
        outfitFilter.season = ",".join(data["filter"]["season"])
        db.session.commit()
    return {
        "filter": current_user.filters[0].as_json(),
    }


@outfits_blueprint.route(OUTFIT_ENDPOINTS.GET_USER_OUTFITS, methods=[HTTP_METHODS.GET])
@login_required
@cross_origin(supports_credentials=True)
def get_user_outfits():
    username = request.args.get("username")
    listType = request.args.get("listType")
    page = int(request.args.get("page"))
    user = User.query.filter_by(username=username).first()
    if listType == "outfits":
        outfits = Outfit.query.filter_by(user_id=user.id).order_by(
            Outfit.date_created.desc()
        )
    if listType == "likes":
        outfits = Outfit.query.filter(Outfit.likers.contains(user))
    outfits = outfits.paginate(page=page, per_page=APP_CONFIG.LIST_VIEW_ITEMS_PER_PAGE)
    return {
        "outfits": [outfit.list_view_response() for outfit in outfits.items],
        "hasMoreOutfits": len(outfits.items) == APP_CONFIG.LIST_VIEW_ITEMS_PER_PAGE,
    }
