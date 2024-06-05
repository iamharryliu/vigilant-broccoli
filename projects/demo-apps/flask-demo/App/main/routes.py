from flask import Blueprint, redirect, render_template, url_for
from App.main.utils import handle_contact_message
from App.main.forms import ContactForm

main_blueprint = Blueprint("main", __name__, template_folder="templates")


@main_blueprint.route("/")
def index():
    return "flask-demo"
