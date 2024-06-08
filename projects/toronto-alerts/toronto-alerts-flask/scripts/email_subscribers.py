import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from App import create_app
import os, argparse, threading, psycopg2
from toronto_alerts_app import TorontoAlertsApp
from mail_handler import MailHandler
from datetime import timedelta
from App.config import SIT_CONFIG
from App.models import Subscription

DATABASE_URL = os.environ.get("TORONTO_ALERTS_DB")


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


def get_users():
    app = create_app(config=SIT_CONFIG)
    ctx = app.app_context()
    ctx.push()
    subscriptions = Subscription.query.all()
    return subscriptions


def email_users(users):
    users = [user for user in users if "message" in user]
    EMAIL_ADDRESS = os.environ.get("TORONTO_ALERTS_EMAIL")
    EMAIL_ADDRESS_PASSWORD = os.environ.get("TORONTO_ALERTS_EMAIL_PASSWORD")
    mailHandler = MailHandler(EMAIL_ADDRESS, EMAIL_ADDRESS_PASSWORD)
    threads = []
    for user in users:
        print(f"Emailing: {user['email']}")
        thread = threading.Thread(
            target=mailHandler.send_email, args=(user["message"],)
        )
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()


def main():
    parser = argparse.ArgumentParser(description="Process alerts for users.")
    parser.add_argument("minutes", type=int, help="Interval in minutes")
    args = parser.parse_args()
    minutes = args.minutes
    emails = get_users()
    users = [
        {
            "email": user.email,
            "districts": user.districts.split(","),
            "keywords": user.keywords.split(","),
        }
        for user in emails
    ]
    for user in users:
        TorontoAlertsApp.get_recent_alerts_for_user(
            user, interval=timedelta(minutes=minutes)
        )
    email_users(users)


if __name__ == "__main__":
    main()
