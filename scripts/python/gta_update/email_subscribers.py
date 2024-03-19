import os
import sys

sys.path.append("..")
from html_parser import HTMLPageParser
from tools.mail_handler import MailHandler
import requests

DATABASE_URL = os.environ.get("GTA_UPDATE_ALERTS_DB")


def get_emails():
    response = requests.get("https://gta-update-alerts-flask.fly.dev/get_emails")
    data = response.json()
    emails = data.get("emails", [])
    return emails


def main():
    emails = get_emails()
    results = HTMLPageParser.get_recent_alerts()
    if results:
        results = [result for result in results if result]
        MailHandler.email_to_list(
            emails,
            message={
                "from": "GTA Update",
                "subject": "GTA Update",
                "body": MailHandler.format_for_email(results),
            },
        )


if __name__ == "__main__":
    main()
