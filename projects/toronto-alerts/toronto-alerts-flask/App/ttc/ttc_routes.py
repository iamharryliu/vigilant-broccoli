from flask import Blueprint, render_template
from App import get_ttc_route_alerts

ttc_blueprint = Blueprint(
    "ttc", __name__, url_prefix="/ttc", template_folder="templates"
)


@ttc_blueprint.route("/")
def index():
    return render_template(
        "ttc_index.html", title="TTC", ttc_route_alerts=get_ttc_route_alerts()
    )
