from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
from pytz import timezone
import urllib


url = "https://gtaupdate.com/"
emails = [
    "harryliu1995@gmail.com",
]


def convert_to_est(time_str):
    today_date = datetime.now(timezone("America/New_York")).date()
    if "-" in time_str:
        datetime_str = f"{time_str} {today_date.year}"
        time_obj = datetime.strptime(datetime_str, "%b-%d %I:%M %p %Y")
    else:
        datetime_str = f"{today_date} {time_str}"
        time_obj = datetime.strptime(datetime_str, "%Y-%m-%d %I:%M %p")
    est = timezone("America/New_York")
    time_obj = est.localize(time_obj)
    return time_obj


def get_all_gta_alerts():
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, "html.parser")
        table = soup.find("table")
        if table:
            rows = table.find_all("tr")
            table_data = []
            for row in rows[1:]:
                cells = row.find_all(["td"])
                row_data = [cell.get_text(strip=True) for cell in cells]
                table_data.append(row_data)
            return table_data
    else:
        print(f"Failed to fetch URL: {url}")


ALL_GTA_ALERTS = get_all_gta_alerts()

GENEREAL_MESSAGE = "Too noisy? You can add filters such as TPS and TFS districts to reduce the noise at https://gta-update-alerts-flask.fly.dev/.\n\n"


class GTAUpdateApp:
    def get_recent_alerts_for_user(user, interval=timedelta(hours=1)):
        filtered_alerts = GTAUpdateApp.filter_alerts_per_user(user, interval)
        if filtered_alerts:
            message = {
                "from": "GTA Update",
                "to": user["email"],
                "subject": "GTA Update",
                "body": GENEREAL_MESSAGE
                + GTAUpdateApp.format_for_email(filtered_alerts)
                + GTAUpdateApp.get_unsubscribe_message(user["email"]),
            }
            user["message"] = message

    def filter_alerts_per_user(user, interval=timedelta(hours=1)):
        districts = user["districts"]
        keywords = user["keywords"]
        current_time_est = datetime.now(timezone("America/New_York"))
        past_hour_est = current_time_est - interval
        res = [
            row
            for row in ALL_GTA_ALERTS
            if (
                (
                    GTAUpdateApp.text_contains_keyword(row[1], districts)
                    if districts
                    else True
                )
                and (
                    GTAUpdateApp.text_contains_keyword(row[2], keywords)
                    if keywords
                    else True
                )
            )
            and convert_to_est(row[0]) >= past_hour_est
        ]
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
        return "Check https://gtaupdate.com/ for more info.\n\n" + formatted_text

    @staticmethod
    def get_unsubscribe_message(email):
        return f"If you want to unsubscribe please click this link https://gta-update-alerts-flask.fly.dev/unsubscribe?email={urllib.parse.quote(email)}\n\n"
