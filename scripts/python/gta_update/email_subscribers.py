import os
import sys
import threading

sys.path.append("..")
from gta_update_app import GTAUpdateApp
from tools.mail_handler import MailHandler
import requests

DATABASE_URL = os.environ.get("GTA_UPDATE_ALERTS_DB")


def get_emails():
    response = requests.get("https://gta-update-alerts-flask.fly.dev/get_emails")
    data = response.json()
    emails = data.get("emails", [])
    return emails


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
    emails = get_emails()
    users = [{"email": email, "districts": [], "keywords": []} for email in emails]
    # users = [{"email": "harryliu1995@gmail.com", "keywords": [""]}]
    for user in users:
        GTAUpdateApp.get_recent_alerts_for_user(user)
    email_users(users)


if __name__ == "__main__":
    main()
