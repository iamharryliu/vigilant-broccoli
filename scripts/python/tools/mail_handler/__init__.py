from email.mime.multipart import MIMEMultipart
from email.header import Header
from email.mime.text import MIMEText
import os, smtplib, ssl, threading

EMAIL_ADDRESS = os.environ.get("MY_EMAIL")
EMAIL_PASSWORD = os.environ.get("MY_EMAIL_PASSWORD")


DEFAULT_EMAIL = {
    "from": "yourself",
    "to": EMAIL_ADDRESS,
    "subject": "subject",
    "body": "body",
}

DEFAULT_SEND_TO_SELF_EMAIL = {
    **DEFAULT_EMAIL,
    "from": "yourself",
}


class MailHandler:
    def format_for_email(list_of_lists):
        formatted_text = "\n\n".join(
            [" ".join(map(str, sublist)) for sublist in list_of_lists]
        )
        return formatted_text

    def send_email(email=DEFAULT_EMAIL):
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            subject = email["subject"]
            body = email["body"]
            message = f"Subject: {subject}\n\n{body}"
            smtp.sendmail(email["from"], email["to"], message)

    def send_465_email(email):
        msg = MIMEMultipart()
        msg["From"] = email["from"]
        msg["To"] = email["to"]
        msg["Subject"] = Header(email["subject"], "utf-8").encode()
        msg_content = MIMEText(body, "plain", "utf-8")
        msg.attach(msg_content)
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, EMAIL_ADDRESS, msg.as_string())
        with smtplib.SMTP("smtp.gmail.com", 465) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            subject = email["subject"]
            body = email["body"]
            message = f"Subject: {subject}\n\n{body}"
            smtp.sendmail(email["from"], email["to"], message)

    def email_to_self(message=DEFAULT_SEND_TO_SELF_EMAIL):
        MailHandler.send_email({**message, "to": EMAIL_ADDRESS})

    def email_to_list(
        emails, message={"from": "Mail Handler", "subject": "subject", "body": "body"}
    ):
        emails = [{**message, "to": email} for email in emails]
        threads = []
        for email in emails:
            thread = threading.Thread(target=MailHandler.send_email, args=(email,))
            threads.append(thread)
            thread.start()

        for thread in threads:
            thread.join()
