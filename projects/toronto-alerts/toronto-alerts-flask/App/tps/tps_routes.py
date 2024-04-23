from flask import Blueprint, render_template

tps_blueprint = Blueprint(
    "tps", __name__, url_prefix="/tps", template_folder="templates"
)


@tps_blueprint.get("")
def index():
    return render_template("tps_index.html", title="TPS")
