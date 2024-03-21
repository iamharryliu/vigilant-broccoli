import os
import sys

sys.path.append("..")

from email_subscribers import format_for_email
from gta_update_app import GTAUpdateApp
from tools.mail_handler import MailHandler
from datetime import timedelta


emails = [
    "harryliu1995@gmail.com",
    "dnchanners@gmail.com",
    "zhenzhentradingco@gmail.com",
]
key_words = ["GALLOWAY RD", "LAWRENCE AVE", "MORNINGSIDE AVE", "KINGSTON RD"]

results = GTAUpdateApp.get_recent_alerts(key_words, frequency=timedelta(minutes=5))
if results:
    results = [result for result in results if result]
    EMAIL_ADDRESS = os.environ.get("GTA_UPDATE_ALERT_EMAIL")
    EMAIL_ADDRESS_PASSWORD = os.environ.get("GTA_UPDATE_ALERT_EMAIL_PASSWORD")
    mailHandler = MailHandler(EMAIL_ADDRESS, EMAIL_ADDRESS_PASSWORD)
    mailHandler.email_to_list(
        emails,
        message={
            "from": "GTA Update",
            "subject": "GTA Update",
            "body": format_for_email(results),
        },
    )
