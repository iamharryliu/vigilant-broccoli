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
                "subject": f"Toronto Alerts - Weather",
                "body": f"Today's weather is {weather_data['weather']['description']}.",
            },
        }
        for user in users
    ]
    email_users(emails)


if __name__ == "__main__":
    main()
