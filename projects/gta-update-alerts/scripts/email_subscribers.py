import os
import sys
import threading

sys.path.append("../../..")
from gta_update_app import GTAUpdateApp
from scripts.python.tools.mail_handler import MailHandler
import requests

DATABASE_URL = os.environ.get("GTA_UPDATE_ALERTS_DB")


def get_users():
    response = requests.get("https://gta-update-alerts-flask.fly.dev/get_users")
    # response = requests.get("http://localhost:5000/get_users")
    data = response.json()
    users = data.get("users", [])
    return users


def email_users(users):
    users = [user for user in users if "message" in user]
    EMAIL_ADDRESS = os.environ.get("GTA_UPDATE_ALERT_EMAIL")
    EMAIL_ADDRESS_PASSWORD = os.environ.get("GTA_UPDATE_ALERT_EMAIL_PASSWORD")
    mailHandler = MailHandler(EMAIL_ADDRESS, EMAIL_ADDRESS_PASSWORD)
    threads = []
    for user in users:
        thread = threading.Thread(
            target=mailHandler.send_email, args=(user["message"],)
        )
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()


def main():
    emails = get_users()
    users = [
        {
            "email": user["email"],
            "districts": user["districts"],
            "keywords": user["keywords"],
        }
        for user in emails
    ]
    # users = [{"email": "harryliu1995@gmail.com", "keywords": [""]}]
    for user in users:
        GTAUpdateApp.get_recent_alerts_for_user(user)
    email_users(users)


if __name__ == "__main__":
    main()
