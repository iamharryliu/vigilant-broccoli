import os
import smtplib
import threading

EMAIL_ADDRESS = os.environ.get("MY_EMAIL")
EMAIL_PASSWORD = os.environ.get("MY_EMAIL_PASSWORD")

DEFAULT_SEND_TO_SELF_EMAIL = {
    "from": "yourself",
    "to": EMAIL_ADDRESS,
    "subject": "subject",
    "body": "body",
}


class MailHandler:
    def format_for_email(list_of_lists):
        formatted_text = "\n\n".join(
            [" ".join(map(str, sublist)) for sublist in list_of_lists]
        )
        return formatted_text

    def send_email(email):
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
