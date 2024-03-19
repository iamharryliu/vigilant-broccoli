import sys

sys.path.append("..")
from html_parser import HTMLPageParser
from tools.mail_handler import MailHandler

emails = [
    "harryliu1995@gmail.com",
]

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
