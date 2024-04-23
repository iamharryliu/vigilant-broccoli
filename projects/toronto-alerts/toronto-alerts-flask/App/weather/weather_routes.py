from flask import Blueprint, render_template
from App.weather.utils import get_weather_data

weather_blueprint = Blueprint(
    "weather", __name__, url_prefix="/weather", template_folder="templates"
)


@weather_blueprint.get("")
def index():
    return render_template(
        "weather-page.html", title="Weather", weather_data=get_weather_data()
    )
