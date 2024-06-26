import os
from flask import flash
from flask_mail import Message
from App import mail
from App.main.forms import ContactForm


def handle_contact_message():
    send_contact_message()
    send_contact_reply()
    flash(f"Your message has been sent.", "success")


def send_contact_message():
    form = ContactForm()
    name = form.name.data
    subject = form.subject.data
    body = f"""Name: {name}
Email: {form.email.data}
Phone: {form.phone.data}
Message: {form.message.data}
	"""
    message = Message(
        recipients=[os.environ.get("MY_EMAIL")], body=body, subject=subject
    )
    mail.send(message)


def send_contact_reply():
    form = ContactForm()
    email = form.email.data
    subject = form.subject.data
    body = "Your message has been received and I will reply as soon as possible."
    reply = Message(recipients=[email], body=body, subject=subject)
    mail.send(reply)
