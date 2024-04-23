import base64
import os
import json, re, requests
from bs4 import BeautifulSoup
import markdown
from App import mail
from flask import current_app
from flask_mail import Message


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
    with open("App/static/district_data.json", "r") as f:
        return json.load(f)


def convert_division_string_for_scraping_data(text):
    pattern = r"^(\d+) Division$"
    return re.match(pattern, text).group(1) + " Div"


def markdown_to_html(text):
    return markdown.markdown(text)


def get_blog_files():
    blog_files = []
    blogs_dir = "App/static/blogs"
    if os.path.exists(blogs_dir):
        for filename in os.listdir(blogs_dir):
            if filename.endswith(".md"):
                with open(os.path.join(blogs_dir, filename), "r") as f:
                    content = f.read()
                    blog_files.append(
                        {"title": filename[:-3], "content": markdown_to_html(content)}
                    )
    return blog_files


def send_verification_email(email):
    msg = Message("Toronto Alerts - Verify Email", recipients=[email])
    token = base64.b64encode(email.encode("utf-8")).decode("utf-8")
    msg.body = f"{current_app.config.get('BACKEND_APP_URL')}/verify?token={token}"
    mail.send(msg)
