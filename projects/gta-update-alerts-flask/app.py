import os
from flask import Flask, render_template, request, redirect, url_for
import psycopg2

app = Flask(__name__)

DATABASE_URL = os.environ.get("GTA_UPDATE_ALERTS_DB")
import requests
from bs4 import BeautifulSoup

url = "https://en.wikipedia.org/wiki/Toronto_Police_Service"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")
TPS_DATA = []
for i in range(3, 5):
    for li in soup.find_all("div", class_="div-col")[i].find_all("li"):
        text = li.text.strip()
        TPS_DATA.append(li.text.strip().split(","))
TPS_DIVISIONS = [
    {"name": division[0], "location": division[1]} for division in TPS_DATA
]
print(len(TPS_DIVISIONS) == 16)

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
print(len(TFS_DATA) == 84)

TFS_STATIONS = [
    {"name": f"TFS {station[0]}", "district": station[1], "location": station[8]}
    for station in TFS_DATA
]


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


@app.route("/")
def index():
    return render_template(
        "index.html", TPS_DIVISIONS=TPS_DIVISIONS, TFS_STATIONS=TFS_STATIONS
    )


@app.post("/submit")
def submit():
    email = request.form["email"]
    if email:
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("INSERT INTO emails (email) VALUES (%s)", (email,))
            conn.commit()
            cur.close()
            conn.close()
            return (
                f"You have successfully subscribed {email}, you can close this window."
            )
        except:
            return "Something went wrong. Have you already signed up?"
    else:
        return redirect(url_for("index"))


@app.get("/get_emails")
def alert_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT email FROM emails;"
    cursor.execute(query)
    emails = [email[0] for email in cursor.fetchall()]
    return {"emails": emails}


@app.get("/unsubscribe")
def unsubscribe():
    email = request.args.get("email")
    if email:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM emails WHERE email = %s", (email,))
            conn.commit()
            cursor.close()
            conn.close()
            return f"You have successfully unsubscribed {email}, you can close this window."
        except:
            return "Something went wrong."
    else:
        return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)
