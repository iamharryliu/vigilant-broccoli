from flask_mail import Message
from WebApp import mail
from WebApp.main.forms import ContactForm

contact_email = "harryliu1995@gmail.com"


def handle_contact_message():
    send_contact_message()
    # send_contact_reply()


def send_contact_message():
    form = ContactForm()
    name = form.name.data
    subject = form.subject.data
    body = f"""Name: {name}
Email: {form.email.data}
Phone: {form.phone.data}
Message: {form.message. data}
	"""
    message = Message(recipients=[contact_email], body=body, subject=subject)
    mail.send(message)


def send_contact_reply():
    form = ContactForm()
    email = form.email.data
    subject = form.subject.data
    body = "Your message has been received and I will reply as soon as possible."
    reply = Message(recipients=[email], body=body, subject=subject)
    mail.send(reply)
