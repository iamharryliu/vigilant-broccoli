import requests, json, re

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36",
    "Upgrade-Insecure-Requests": "1",
    "DNT": "1",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
}
TTC_SERVICE_ALERTS_URL = "https://alerts.ttc.ca/api/alerts/live-alerts"


def main():
    print("Scraping TTC Service Lines")
    res = requests.get(TTC_SERVICE_ALERTS_URL, headers=headers)
    json = res.json()
    routes = [route for route in json["routes"]]
    ttc_route_alerts = [route for route in routes if route["alertType"] == "Planned"]
    res = ttc_route_alerts
    lines = [alert["route"] for alert in res]
    save_json(lines)


def save_json(new_data, filepath="ttc_lines.json"):
    try:
        with open(filepath, "r") as file:
            data_list = json.load(file)
            data_list = list(set(data_list + new_data))
            data_list = sorted(data_list, key=custom_sort_key)
    except:
        data_list = new_data
    with open(filepath, "w") as file:
        json.dump(data_list, file, indent=2)
        file.write("\n")


def custom_sort_key(route):
    numeric_part = int(re.match(r"\d+", route).group())
    alpha_part = route[len(str(numeric_part)) :]
    return (numeric_part, alpha_part)


if __name__ == "__main__":
    main()
