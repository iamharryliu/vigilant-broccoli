import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from App.weather.utils import get_weather_data
from email_subscribers import get_users, email_users


def main():
    users = get_users()
    weather_data = get_weather_data()
    emails = [
        {
            "email": user["email"],
            "message": {
                "from": "Toronto Alerts",
                "to": user["email"],
                "subject": f"Toronto Alerts - Weather - {weather_data['weather']['description']}, {weather_data['weather']['temp']}°C ",
                "body": f"Today's weather is {weather_data['weather']['description']}, {weather_data['weather']['temp_min']}°C to {weather_data['weather']['temp_max']}°C.\n\nCurrently {weather_data['weather']['temp'],}°C.\nFeels like {weather_data['weather']['feels_like']}°C\n\n{weather_data['weather']['clouds']}% Cloudiness\n{weather_data['weather']['humidity']}% Humidity\n\nSunrise at {weather_data['sun']['sunrise'].strftime('%-H:%M')}am\n Sunset at {weather_data['sun']['sunset'].strftime('%-H:%M')}pm",
            },
        }
        for user in users
    ]
    email_users(emails)


if __name__ == "__main__":
    main()
