from linode_api import LinodeAPI
from tools.mail_handler import MailHandler
import logging
from pathlib import Path
import requests


logging.basicConfig(
    filename=f"{Path.home()}/logs/site-monitor.log",
    level=logging.INFO,
    format="%(asctime)s\t%(levelname)s\t%(message)s",
)


class SiteMonitor:
    def check_servers(servers):
        for server in servers:
            SiteMonitor.check_server(server)

    def check_server(server):
        try:
            r = requests.get(server["url"], timeout=5)
            if r.status_code != 200:
                SiteMonitor.handle_server_failure(server)
            else:
                logging.info(f'{server["name"]} is up.')
        except:
            SiteMonitor.handle_server_failure(server)

    def handle_server_failure(server):
        subject = f'{server["name"]} is down!'
        body = f'Please check on {server["name"]}.'
        logging.critical(subject)
        email = {"subject": subject, "body": body}
        logging.info("Notifying site manager.")
        MailHandler.email_to_self(email)
        if "linode-server" in server:
            logging.info("Attempting to reboot server.")
            LinodeAPI.reboot_server(server)
