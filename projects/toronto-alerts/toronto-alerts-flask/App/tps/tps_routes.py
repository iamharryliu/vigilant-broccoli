from flask import Blueprint, render_template
from scripts.utils import get_parsed_x_hours_of_alerts

tps_blueprint = Blueprint(
    "tps", __name__, url_prefix="/tps", template_folder="templates"
)


@tps_blueprint.get("")
def index():
    return render_template(
        "tps_index.html",
        title="TPS",
        gta_updates=get_parsed_x_hours_of_alerts(hours=0.5),
    )
