from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
from pytz import timezone
import sys

sys.path.append("..")
from tools.mail_handler import MailHandler


url = "https://gtaupdate.com/"
emails = [
    "harryliu1995@gmail.com",
    "dnchanners@gmail.com",
    "zhenzhentradingco@gmail.com",
]


class HTMLPageParser:
    def get_recent_alerts():
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "html.parser")
            table = soup.find("table")
            if table:
                rows = table.find_all("tr")
                table_data = []
                for row in rows[1:]:
                    cells = row.find_all(["th", "td"])
                    row_data = [cell.get_text(strip=True) for cell in cells]

                    current_time_est = datetime.now(timezone("America/New_York"))
                    past_hour_est = current_time_est - timedelta(hours=1)
                    if convert_to_est(row_data[0]) >= past_hour_est:
                        table_data.append(row_data)
                return table_data
        else:
            print(f"Failed to fetch URL: {url}")


def convert_to_est(time_str):
    today_date = datetime.now().date()
    if "-" in time_str:
        datetime_str = f"{time_str} {today_date.year}"
        time_obj = datetime.strptime(datetime_str, "%b-%d %I:%M %p %Y")
    else:
        datetime_str = f"{today_date} {time_str}"
        time_obj = datetime.strptime(datetime_str, "%Y-%m-%d %I:%M %p")
    est = timezone("America/New_York")
    time_obj = est.localize(time_obj)
    return time_obj


results = HTMLPageParser.get_recent_alerts()
if results:
    results = [result for result in results if result]
    MailHandler.email_to_list(
        emails,
        message={
            "from": "GTA Update",
            "subject": "GTA Update",
            "body": MailHandler.format_for_email(results),
        },
    )
