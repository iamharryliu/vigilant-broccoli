import os
from flask import Flask, render_template, request, redirect, url_for, flash
import psycopg2
from google_recaptcha import ReCaptcha
from App.utils import (
    get_blog_files,
    get_districts_data,
    convert_division_string_for_scraping_data,
    get_github_action_ip_addresses,
    markdown_to_html,
)


DATABASE_URL = os.environ.get("GTA_UPDATE_ALERTS_DB")


def create_app():
    app = Flask(__name__, template_folder="templates")
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")

    recaptcha = ReCaptcha(
        app=app,
        site_key=os.environ.get("GTA_UPDATE_ALERTS_RECAPTCHA_SITE_KEY"),
        site_secret=os.environ.get("GTA_UPDATE_ALERTS_RECAPTCHA_SECRET_KEY"),
    )

    def get_db_connection():
        return psycopg2.connect(DATABASE_URL)

    @app.route("/", methods=["GET", "POST"])
    def index():
        # blogs = get_blog_files()
        blogs = []
        return render_template("pages/home-page/index.html", blogs=blogs)

    @app.route("/subscribe", methods=["GET", "POST"])
    def subscribe():
        DISTRICT_DATA = get_districts_data()
        if request.method == "POST" and recaptcha.verify():
            submit_form()
        return render_template(
            "pages/subscribe-page.html",
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
        # github_action_ips = get_github_action_ip_addresses()
        # github_action_ips = github_action_ips
        # client_ip = request.remote_addr
        # if client_ip in github_action_ips:
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
        # return redirect(url_for("index"))

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

    @app.get("/blog")
    def blog():
        blog_content = get_blog_files()[0]["content"]
        return render_template(
            "pages/blog-page.html",
            blog_content=markdown_to_html(blog_content),
        )

    return app
