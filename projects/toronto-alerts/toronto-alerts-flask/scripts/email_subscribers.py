import os, argparse, threading, psycopg2
from toronto_alerts_app import TorontoAlertsApp
from mail_handler import MailHandler
from datetime import timedelta

DATABASE_URL = os.environ.get("GTA_UPDATE_ALERTS_DB")


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT email, districts, keywords FROM emails;"
    cursor.execute(query)
    users = [
        {
            "email": user[0],
            "districts": user[1] if user[1] else [],
            "keywords": user[2] if user[2] else [],
        }
        for user in cursor.fetchall()
    ]
    return users


def email_users(users):
    users = [user for user in users if "message" in user]
    EMAIL_ADDRESS = os.environ.get("GTA_UPDATE_ALERT_EMAIL")
    EMAIL_ADDRESS_PASSWORD = os.environ.get("GTA_UPDATE_ALERT_EMAIL_PASSWORD")
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
            "email": user["email"],
            "districts": user["districts"],
            "keywords": user["keywords"],
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
