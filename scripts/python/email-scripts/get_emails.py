import imaplib
import email
import os

IMAP_SERVER = "imap.gmail.com"
USERNAME = os.environ.get("GTA_UPDATE_ALERT_EMAIL")
PASSWORD = os.environ.get("GTA_UPDATE_ALERT_EMAIL_PASSWORD")
FILTER_SENDERS = ["myttc.e-alerts@ttc.ca"]

# Connect to the Gmail IMAP server
mail = imaplib.IMAP4_SSL(IMAP_SERVER)
mail.login(USERNAME, PASSWORD)

# Select the mailbox (inbox in this case)
mail.select("inbox")

# Search for all unseen emails
result, data = mail.search(None, "UNSEEN")

# Iterate over each email ID
for num in data[0].split():
    # Fetch the email based on its ID
    result, data = mail.fetch(num, "(RFC822)")
    raw_email = data[0][1]
    # Parse the raw email using the email library
    msg = email.message_from_bytes(raw_email)
    # Print the email sender, subject, and body
    sender = msg["From"]
    print(msg["From"])
    if any(sender.startswith(sender_email) for sender_email in FILTER_SENDERS):
        print("From:", msg["From"])
        print("Subject:", msg["Subject"])
        # If the email has multiple parts, iterate over them
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))
                if "attachment" not in content_disposition:
                    body = part.get_payload(decode=True)
                    print("Body:", body)
        else:
            # If the email has a single part, directly get the payload
            body = msg.get_payload(decode=True)
            print("Body:", body)

# Logout from the server
mail.logout()
