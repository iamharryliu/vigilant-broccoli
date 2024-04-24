from datetime import datetime, timedelta
from pytz import timezone
import requests
from bs4 import BeautifulSoup

GTA_UPDATE_URL = "https://gtaupdate.com/"


def get_all_gta_alerts():
    response = requests.get(GTA_UPDATE_URL)
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
        print(f"Failed to fetch URL: {GTA_UPDATE_URL}")


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


def get_past_x_hours_of_alerts(hours=1):
    current_time_est = datetime.now(timezone("America/New_York"))
    past_hour_est = current_time_est - timedelta(hours=hours)
    res = [
        row for row in get_all_gta_alerts() if convert_to_est(row[0]) >= past_hour_est
    ]
    return res


def get_parsed_x_hours_of_alerts(hours=1):
    alerts = get_past_x_hours_of_alerts(hours)
    alerts = [
        " | ".join(map(str, alert)) for alert in get_past_x_hours_of_alerts(hours)
    ]
    return alerts
