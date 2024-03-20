import os, smtplib, threading

DEFAULT_EMAIL = {
    "from": "yourself",
    "to": os.environ.get("MY_EMAIL"),
    "subject": "subject",
    "body": "body",
}

DEFAULT_SEND_TO_SELF_EMAIL = {
    **DEFAULT_EMAIL,
    "from": "yourself",
}


class MailHandler:
    def __init__(
        self,
        EMAIL_ADDRESS=os.environ.get("MY_EMAIL"),
        EMAIL_ADDRESS_PASSWORD=os.environ.get("MY_EMAIL_PASSWORD"),
    ):
        self.EMAIL_ADDRESS = EMAIL_ADDRESS
        self.EMAIL_PASSWORD = EMAIL_ADDRESS_PASSWORD

    def send_email(self, email=DEFAULT_EMAIL):
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(self.EMAIL_ADDRESS, self.EMAIL_PASSWORD)
            subject = email["subject"]
            body = email["body"]
            message = f"Subject: {subject}\n\n{body}"
            smtp.sendmail(email["from"], email["to"], message)

    def email_to_self(self, message=DEFAULT_SEND_TO_SELF_EMAIL):
        MailHandler.send_email({**message, "to": self.EMAIL_ADDRESS})

    def email_to_list(
        self,
        emails,
        message={"from": "Mail Handler", "subject": "subject", "body": "body"},
    ):
        emails = [{**message, "to": email} for email in emails]
        threads = []
        for email in emails:
            thread = threading.Thread(target=self.send_email, args=(email,))
            threads.append(thread)
            thread.start()

        for thread in threads:
            thread.join()
