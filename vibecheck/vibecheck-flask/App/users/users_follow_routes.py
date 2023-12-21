from flask import request, Blueprint, jsonify, session
from App.models import User
from App.database import db_session

blueprint = Blueprint("users_follow_blueprint", __name__)


@blueprint.route("follow", methods=["POST"])
def follow():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    current_user = User.query.filter_by(username=session["user"]["username"]).first()
    current_user.following.extend([user])
    db_session.commit()
    return jsonify({})


@blueprint.route("unfollow", methods=["POST"])
def unfollow():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    current_user = User.query.filter_by(username=session["user"]["username"]).first()
    current_user.following.remove(user)
    db_session.commit()
    return jsonify({})


@blueprint.route("remove_follower", methods=["POST"])
def remove_follower():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    current_user = User.query.filter_by(username=session["user"]["username"]).first()
    current_user.followers.remove(user)
    db_session.commit()
    return jsonify({})
