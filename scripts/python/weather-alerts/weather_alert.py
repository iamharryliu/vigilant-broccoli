import os
import requests
from datetime import datetime


def main():
    # city = 'toronto'
    city = "malmo"
    data = requests.get(
        f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={os.environ.get('OPENWEATHER_API_KEY')}"
    ).json()
    weather = data["weather"][0]["description"]
    if weather in ["shower rain", "rain", "thunderstorm"]:
        pass


if __name__ == "__main__":
    main()
