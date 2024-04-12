import imaplib
import email
import os
import re

IMAP_SERVER = "imap.gmail.com"
USERNAME = os.environ.get("GTA_UPDATE_ALERT_EMAIL")
PASSWORD = os.environ.get("GTA_UPDATE_ALERT_EMAIL_PASSWORD")
TTC_ALERTS_EMAIL = "myttc.e-alerts@ttc.ca"
FILTER_SENDERS = [TTC_ALERTS_EMAIL]
mail = imaplib.IMAP4_SSL(IMAP_SERVER)
mail.login(USERNAME, PASSWORD)
mail.select("inbox")

result, data = mail.search(None, f'(FROM "{TTC_ALERTS_EMAIL}")')
email_ids = data[0].split()


def parse_data(entry):
    match = re.match(
        r"^(.*?): (Minor delays|Regular service|No service|Detour) (.*)", entry
    )
    return {
        "service": match.group(1).strip(),
        "status": match.group(2).strip(),
        "location": match.group(3).strip(),
    }


def get_data_from_email_ids(email_ids, limit=10):
    res = []
    for num in email_ids[-(limit):]:
        _, data = mail.fetch(num, "(RFC822)")
        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)
        subject = msg["Subject"]
        if "Elevator" in subject:
            continue

        parsed_data = parse_data(subject)
        print(parsed_data)
        res.append(parse_data)
    return res


data = get_data_from_email_ids(email_ids)
mail.logout()

res = {}

for alert in data:
    service = alert["service"]
    status = alert["status"]
    location = alert["location"]
    # print(location)
    if service not in res:
        res[service] = {}
    if status != "Regular service":
        res[service][location] = status
    if status == "Regular service":
        del res[service][location]

print(res)
