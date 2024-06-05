from flask import request, Blueprint, jsonify
from flask_login import login_required, current_user
from App import db
from App.models import User

blueprint = Blueprint("users_follow_blueprint", __name__)


@blueprint.route("follow", methods=["POST"])
@login_required
def follow():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    current_user.following.extend([user])
    db.session.commit()
    return jsonify({})


@blueprint.route("unfollow", methods=["POST"])
@login_required
def unfollow():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    current_user.following.remove(user)
    db.session.commit()
    return jsonify({})


@blueprint.route("remove_follower", methods=["POST"])
@login_required
def remove_follower():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    current_user.followers.remove(user)
    db.session.commit()
    return jsonify({})
