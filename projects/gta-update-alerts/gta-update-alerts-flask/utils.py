import json, re, requests
from bs4 import BeautifulSoup


def get_districts_data():
    # districts = return get_districts_from_wiki()
    districts = get_districts_from_json()
    districts["TPS_DIVISIONS"] = sorted(
        districts["TPS_DIVISIONS"], key=lambda district: district["name"]
    )
    districts["TFS_STATIONS"] = sorted(
        districts["TFS_STATIONS"], key=lambda district: district["name"]
    )
    return districts


def get_districts_from_wiki():
    DISTRICTS_DATA = {}
    url = "https://en.wikipedia.org/wiki/Toronto_Police_Service"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    TPS_DATA = []
    for i in range(3, 5):
        for li in soup.find_all("div", class_="div-col")[i].find_all("li"):
            text = li.text.strip()
            TPS_DATA.append(li.text.strip().split(","))
    DISTRICTS_DATA["TPS_DIVISIONS"] = [
        {"name": division[0], "location": division[1]} for division in TPS_DATA
    ]
    url = "https://en.wikipedia.org/wiki/Toronto_Fire_Services"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    TFS_DATA = []
    for i in range(2, 6):
        table = soup.find_all("table", class_="wikitable")[i]
        for row in table.find_all("tr")[1:]:
            row_data = []
            cells = row.find_all(["th", "td"])
            row_data.extend(cell.get_text(strip=True) for cell in cells)
            TFS_DATA.append(row_data)
    DISTRICTS_DATA["TFS_STATIONS"] = [
        {
            "name": f"TFS {station[0]}",
            "district": station[1],
            "location": station[8].split(",")[0],
        }
        for station in TFS_DATA
    ]
    return DISTRICTS_DATA


def get_districts_from_json():
    with open("district_data.json", "r") as f:
        return json.load(f)


def convert_division_string_for_scraping_data(text):
    pattern = r"^(\d+) Division$"
    return re.match(pattern, text).group(1) + " Div"
