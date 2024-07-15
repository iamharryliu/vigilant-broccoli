from datetime import datetime, timedelta
from pytz import timezone
import urllib
from utils import get_all_gta_alerts, convert_to_est
import logging

# Configure the logger
logging.basicConfig(
    level=logging.DEBUG,  # Set the logging level to DEBUG
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",  # Define the log message format
    filename="app.log",  # Log messages will be saved to 'app.log'
    filemode="w",  # Use 'w' for overwriting the file each time, 'a' for appending to the file
)

# Create a logger object
logger = logging.getLogger(__name__)


class TorontoAlertsApp:
    def get_recent_alerts_for_user(user, interval=timedelta(hours=1)):
        filtered_alerts = TorontoAlertsApp.filter_alerts_per_user(user, interval)
        if filtered_alerts:
            message = {
                "from": "Toronto Alerts",
                "to": user["email"],
                "subject": f"Toronto Alerts - {len(filtered_alerts)} New Alerts",
                "body": "Alerts:\n\n"
                + TorontoAlertsApp.format_for_email(filtered_alerts)
                + "Too noisy? Update filters such as TPS and TFS districts to reduce the noise at https://torontoalerts.com/\n\n"
                + f"Unsubscribe: https://torontoalerts.com/unsubscribe?email={urllib.parse.quote(user['email'])}\n\n",
            }
            user["message"] = message

    def filter_alerts_per_user(user, interval=timedelta(hours=1)):
        districts = user["districts"]
        keywords = user["keywords"]
        current_time_est = datetime.now(timezone("America/New_York"))
        past_hour_est = current_time_est - interval
        res = [
            row
            for row in get_all_gta_alerts()
            if (
                (
                    TorontoAlertsApp.text_contains_keyword(row[1], districts)
                    if districts
                    else True
                )
                and (
                    TorontoAlertsApp.text_contains_keyword(row[2], keywords)
                    if keywords
                    else True
                )
            )
            and convert_to_est(row[0]) >= past_hour_est
        ]
        logger.debug(res)
        return res

    def text_contains_keyword(text, keywords):
        for keyword in keywords:
            if keyword in text:
                return True
        return False

    def format_for_email(list_of_lists):
        formatted_text = "\n\n".join(
            [" ".join(map(str, sublist)) for sublist in list_of_lists]
        )
        return formatted_text + "\n\n"
