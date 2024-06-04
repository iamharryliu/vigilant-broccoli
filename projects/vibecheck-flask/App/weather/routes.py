from flask import request
from flask_login import login_required, current_user
from flask_cors import cross_origin
from App import db
from App.config import (
    APP_CONFIG,
)
from App.constants import BLUEPRINTS, HTTP_METHODS, WEATHER_ENDPOINTS
from App.weather.utils import OpenWeatherService

weather_blueprint = BLUEPRINTS.WEATHER_BLUEPRINT


@weather_blueprint.route(WEATHER_ENDPOINTS.GET_WEATHER_DATA, methods=[HTTP_METHODS.GET])
@login_required
@cross_origin(supports_credentials=True)
def get_weather_data():
    latitude = request.args.get("latitude")
    longitude = request.args.get("longitude")
    return OpenWeatherService.get_weather_data(latitude, longitude)


@weather_blueprint.route(
    WEATHER_ENDPOINTS.SET_PREFERRED_TEMPERATURE_SCALE, methods=[HTTP_METHODS.POST]
)
@login_required
@cross_origin(supports_credentials=True)
def set_preferred_temperature_scale():
    scale = request.get_json()["scale"]
    current_user.preferred_temperature_scale = scale
    db.session.commit()
    return {}
