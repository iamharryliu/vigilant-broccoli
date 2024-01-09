from flask import Blueprint, jsonify, abort

main = Blueprint("main", __name__, template_folder="templates")


@main.route("/")
def home():
    return jsonify({"message": "message"})
