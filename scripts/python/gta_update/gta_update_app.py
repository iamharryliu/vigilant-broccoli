from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
from pytz import timezone


url = "https://gtaupdate.com/"
emails = [
    "harryliu1995@gmail.com",
]


class GTAUpdateApp:
    def text_contains_keyword(text, keywords):
        for keyword in keywords:
            if keyword in text:
                return True
        return False

    def get_recent_alerts(key_words=None, frequency=timedelta(hours=1)):
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "html.parser")
            table = soup.find("table")
            if table:
                rows = table.find_all("tr")
                table_data = []
                for row in rows[1:]:
                    cells = row.find_all(["td"])
                    if key_words:
                        for cell in cells:
                            if GTAUpdateApp.text_contains_keyword(
                                cell.get_text().strip(), key_words
                            ):
                                table_data.append(
                                    [cell.get_text().strip() for cell in cells]
                                )

                        current_time_est = datetime.now(timezone("America/New_York"))
                        print("current", current_time_est)
                        past_hour_est = current_time_est - frequency
                        table_data = [
                            row
                            for row in table_data
                            if convert_to_est(row[0]) >= past_hour_est
                        ]
                    else:
                        row_data = [cell.get_text(strip=True) for cell in cells]
                        current_time_est = datetime.now(timezone("America/New_York"))
                        print("current", current_time_est)
                        past_hour_est = current_time_est - frequency
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
    print(time_obj)
    return time_obj
