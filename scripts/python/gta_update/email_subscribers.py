import os
import sys
import threading
import urllib

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


def email_to_list(
    emails, message={"from": "Mail Handler", "subject": "subject", "body": "body"}
):
    emails = [{**message, "to": email} for email in emails]
    threads = []
    EMAIL_ADDRESS = os.environ.get("GTA_UPDATE_ALERT_EMAIL")
    print(len(EMAIL_ADDRESS) == 30)
    EMAIL_ADDRESS_PASSWORD = os.environ.get("GTA_UPDATE_ALERT_EMAIL_PASSWORD")
    mailHandler = MailHandler(EMAIL_ADDRESS, EMAIL_ADDRESS_PASSWORD)
    for email in emails:
        thread = threading.Thread(
            target=mailHandler.send_email,
            args=(
                {
                    **email,
                    "body": f"If you want to unsubscribe please click this link https://gta-update-alerts-flask.fly.dev/unsubscribe?email={urllib.parse.quote(email['to'])}\n\n"
                    + email["body"],
                },
            ),
        )
        threads.append(thread)
        thread.start()
    for thread in threads:
        thread.join()


def format_for_email(list_of_lists):
    formatted_text = "\n\n".join(
        [" ".join(map(str, sublist)) for sublist in list_of_lists]
    )
    return "Check https://gtaupdate.com/ for more info.\n\n" + formatted_text


def main():
    emails = get_emails()
    results = HTMLPageParser.get_recent_alerts()
    if results:
        results = [result for result in results if result]
        email_to_list(
            emails,
            message={
                "from": "GTA Update",
                "subject": "GTA Update",
                "body": format_for_email(results),
            },
        )


if __name__ == "__main__":
    main()
