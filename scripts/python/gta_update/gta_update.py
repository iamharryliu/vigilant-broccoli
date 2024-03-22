from datetime import timedelta
import os
import sys
import threading

sys.path.append("..")

from gta_update_app import GTAUpdateApp
from tools.mail_handler import MailHandler


emails = [
    "harryliu1995@gmail.com",
    "dnchanners@gmail.com",
    "zhenzhentradingco@gmail.com",
]
districts = ["TFS234", "43 Div"]
keywords = ["GALLOWAY RD", "LAWRENCE AVE", "MORNINGSIDE AVE", "KINGSTON RD"]
keywords = []


def email_users(users):
    users = [user for user in users if "message" in user]
    # print(users)
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
    users = [
        {"email": email, "keywords": keywords, "districts": districts}
        for email in emails
    ]
    for user in users:
        GTAUpdateApp.get_recent_alerts_for_user(user, interval=timedelta(minutes=5))
    email_users(users)


if __name__ == "__main__":
    main()
