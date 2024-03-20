import sys

sys.path.append("..")
from html_parser import HTMLPageParser
from tools.mail_handler import MailHandler
from datetime import timedelta


emails = [
    "harryliu1995@gmail.com",
    # "dnchanners@gmail.com",
    # "zhenzhentradingco@gmail.com",
]
key_words = ["GALLOWAY RD", "LAWRENCE AVE", "MORNINGSIDE AVE", "KINGSTON RD"]

results = HTMLPageParser.get_recent_alerts(key_words, frequency=timedelta(minutes=5))
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
