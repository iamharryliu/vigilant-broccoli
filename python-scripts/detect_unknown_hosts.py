import os
import subprocess
import smtplib
from tools.mail_handler import MailHandler

DIR_PATH = os.path.dirname(os.path.realpath(__file__))
NETWORK_NAME = os.environ.get("NETWORK_NAME")


def get_unknown_hosts():
    file = f"{DIR_PATH}/unknown-hosts-scan"
    with open(f"{file}", "r") as f:
        return f.read()

def notify_user(unknown_hosts)
    subject = f"UNKOWN HOSTS IN NETWORK {NETWORK_NAME}"
    body = unknown_hosts
    email = {"subject": subject, "body": body}
    MailHandler.email_to_self(email)


def has_threats():
    command = f"{DIR_PATH}/scan.sh"
    p = subprocess.Popen(["sudo", "-E", "sh", "-c", command])
    p.wait()
    threats = os.stat(f"{DIR_PATH}/unknown-hosts").st_size > 0
    return threats


if __name__ == "__main__":
    if has_threats():
        unknown_hosts = get_unknown_hosts()
        notify_user(unknown_hosts)
