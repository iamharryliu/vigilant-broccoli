from flask import Blueprint, jsonify
from WebApp.models import User

main = Blueprint("main", __name__, template_folder="templates")


@main.route("/")
def home():
    return jsonify({"message": "message"})


@main.route("/get_users")
def get_users():
    users = User.query.all()
    return jsonify({"users": users})
