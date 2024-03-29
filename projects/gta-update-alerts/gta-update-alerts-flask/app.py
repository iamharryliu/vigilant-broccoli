import os
from flask import Flask, render_template, request, redirect, url_for, flash
import psycopg2
from google_recaptcha import ReCaptcha
from utils import get_districts_data, convert_division_string_for_scraping_data

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")

DISTRICT_DATA = get_districts_data()

DATABASE_URL = os.environ.get("GTA_UPDATE_ALERTS_DB")


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


recaptcha = ReCaptcha(
    app=app,
    site_key=os.environ.get("GTA_UPDATE_ALERTS_RECAPTCHA_SITE_KEY"),
    site_secret=os.environ.get("GTA_UPDATE_ALERTS_RECAPTCHA_SECRET_KEY"),
)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST" and recaptcha.verify():
        submit_form()
    return render_template(
        "index.html",
        TPS_DIVISIONS=DISTRICT_DATA["TPS_DIVISIONS"],
        TFS_STATIONS=DISTRICT_DATA["TFS_STATIONS"],
    )


def submit_form():
    email = request.form["email"]
    tps_divisions = request.form.getlist("divisions")
    tps_divisions = [
        convert_division_string_for_scraping_data(division)
        for division in tps_divisions
    ]
    tfs_stations = request.form.getlist("stations")
    districts = tps_divisions + tfs_stations
    keywords = request.form["keywords"]
    keywords = keywords.upper()
    keywords = keywords.replace(" ", "")
    keywords = [keyword for keyword in keywords.split(",") if keyword]
    ",".join(keywords)
    if email:
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO emails (email, districts, keywords) VALUES (%s, %s, %s) ON CONFLICT (email) DO UPDATE SET districts = EXCLUDED.districts, keywords = EXCLUDED.keywords",
                (email, districts, keywords),
            )
            connection.commit()
            cursor.close()
            connection.close()
            flash(
                f"You have successfully subscribed {email}.",
                "success",
            )
            return redirect(url_for("index"))
        except:
            flash("Something went wrong. Have you already signed up?", "danger")
            return redirect(url_for("index"))
    else:
        return redirect(url_for("index"))


@app.get("/get_users")
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT email, districts, keywords FROM emails;"
    cursor.execute(query)
    users = [
        {
            "email": user[0],
            "districts": user[1] if user[1] else [],
            "keywords": user[2] if user[2] else [],
        }
        for user in cursor.fetchall()
    ]
    return {"users": users}


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
            flash(f"You have successfully unsubscribed {email}.", "danger")
            return redirect(url_for("index"))
        except:
            flash("Something went wrong.")
            return redirect(url_for("index"))
    else:
        return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)
