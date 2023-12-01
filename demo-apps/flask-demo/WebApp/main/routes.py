from flask import Blueprint, jsonify

main = Blueprint("main", __name__, template_folder="templates")


@main.route("/")
def home():
    return jsonify({"message": "Index endpoint"})
