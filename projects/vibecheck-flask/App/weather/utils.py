import requests


class OpenWeatherService:
    OW_BASE_URL = "https://api.openweathermap.org/data/2.5"
    APP_ID = "appid=aece3df66a4c1d04d7783fc4d7aa009f"

    def get_weather_data(latitude, longitude):
        location_query = OpenWeatherService.get_location_query(latitude, longitude)
        one_call_response = requests.get(
            OpenWeatherService.get_one_call_req_url(location_query)
        )
        current_weather_response = requests.get(
            OpenWeatherService.get_current_weather_req_url(location_query)
        )
        return {
            **one_call_response.json(),
            "name": current_weather_response.json()["name"],
        }

    def get_one_call_req_url(location_query):
        return f"{OpenWeatherService.OW_BASE_URL}/onecall?{location_query}&exclude=minutely,alerts"

    def get_current_weather_req_url(location_query):
        return f"{OpenWeatherService.OW_BASE_URL}/weather?{location_query}"

    def get_location_query(latitude, longtitude):
        return f"lat={latitude}&lon={longtitude}&{OpenWeatherService.APP_ID}"
