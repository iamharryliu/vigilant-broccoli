import requests

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36",
    "Upgrade-Insecure-Requests": "1",
    "DNT": "1",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
}
TTC_SERVICE_ALERTS_URL = "https://alerts.ttc.ca/api/alerts/live-alerts"


def get_ttc_alerts():
    res = requests.get(TTC_SERVICE_ALERTS_URL, headers=headers)
    json = res.json()
    routes = [route for route in json["routes"]]
    ttc_notices = [route for route in routes if route["alertType"] == "SiteWide"]
    ttc_route_alerts = [route for route in routes if route["alertType"] == "Planned"]
    res = {"notices": ttc_notices, "route_alerts": ttc_route_alerts}
    return res
