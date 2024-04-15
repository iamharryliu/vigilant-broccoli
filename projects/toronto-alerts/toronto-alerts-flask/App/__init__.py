import os
from flask import Flask, render_template, request, redirect, url_for, flash
import psycopg2
from google_recaptcha import ReCaptcha
from App.utils import (
    get_blog_files,
    get_districts_data,
    convert_division_string_for_scraping_data,
    markdown_to_html,
)
from App.config import DIT_CONFIG
from App.const import ENDPOINT
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


DATABASE_URL = os.environ.get("GTA_UPDATE_ALERTS_DB")


def create_app(config=DIT_CONFIG):
    # Initialize App
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object(config)

    # Initialize Dependencies
    recaptcha = ReCaptcha(
        app=app,
        site_key=os.environ.get("GTA_UPDATE_ALERTS_RECAPTCHA_SITE_KEY"),
        site_secret=os.environ.get("GTA_UPDATE_ALERTS_RECAPTCHA_SECRET_KEY"),
    )

    def get_db_connection():
        return psycopg2.connect(DATABASE_URL)

    @app.route(ENDPOINT.INDEX, methods=["GET", "POST"])
    def index():
        # blogs = get_blog_files()
        blogs = []
        return render_template(
            "pages/home-page/index.html",
            title="Home",
            blogs=blogs,
            ttc_alerts=get_ttc_alerts(),
        )

    from App.ttc.ttc_routes import ttc_blueprint

    app.register_blueprint(ttc_blueprint)

    @app.route(ENDPOINT.SUBSCRIBE, methods=["GET", "POST"])
    def subscribe():
        DISTRICT_DATA = get_districts_data()
        if request.method == "POST" and recaptcha.verify():
            submit_form()
        return render_template(
            "pages/subscribe-page.html",
            title="Subscribe",
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

    @app.get(ENDPOINT.GET_USERS)
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

    @app.get(ENDPOINT.UNSUBSCRUBE)
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

    @app.get(ENDPOINT.BLOGS)
    def blogs():
        blogs = get_blog_files()
        return render_template("pages/blogs-directory.html", title="Blogs", blogs=blogs)

    @app.get(ENDPOINT.BLOG)
    def blog():
        blog_content = get_blog_files()[0]["content"]
        return render_template(
            "pages/blog-page.html",
            title="Blog Name",
            blog_content=markdown_to_html(blog_content),
        )

    return app
