import os
import requests
from datetime import datetime
import pytz


def get_weather_data():
    data = requests.get(
        f"https://api.openweathermap.org/data/2.5/weather?q=toronto&appid={os.environ.get('OPENWEATHER_API_KEY')}"
    ).json()

    sunrise = datetime.fromtimestamp(data["sys"]["sunrise"])
    sunset = datetime.fromtimestamp(data["sys"]["sunset"])

    # Convert UTC datetime to Toronto timezone
    toronto_timezone = pytz.timezone("America/Toronto")
    sunrise = sunrise.replace(tzinfo=pytz.utc).astimezone(toronto_timezone)
    sunset = sunset.replace(tzinfo=pytz.utc).astimezone(toronto_timezone)

    weather_data = {
        "sun": {
            "sunrise": sunrise,
            "sunset": sunset,
        },
        "weather": {
            "description": data["weather"][0]["description"],
            "temp": round(data["main"]["temp"] - 273.15),
            "feels_like": round(data["main"]["feels_like"] - 273.15),
            "temp_min": round(data["main"]["temp_min"] - 273.15),
            "temp_max": round(data["main"]["temp_max"] - 273.15),
            "clouds": data["clouds"]["all"],
            "humidity": data["main"]["humidity"],
        },
    }
    return weather_data
