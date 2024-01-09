import os
import smtplib

EMAIL_ADDRESS = os.environ.get("MY_EMAIL")
EMAIL_PASSWORD = os.environ.get("MY_EMAIL_PASSWORD")


class MailHandler:
    def email_to_self(email={"subject": "subject", "body": "body"}):
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            subject = email["subject"]
            body = email["body"]
            message = f"Subject: {subject}\n\n{body}"
            smtp.sendmail(EMAIL_ADDRESS, EMAIL_ADDRESS, message)
