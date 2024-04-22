import base64
import os
from flask import Flask, render_template, request, redirect, url_for, flash, current_app
from flask_mail import Mail, Message
import psycopg2
from google_recaptcha import ReCaptcha
from App.utils import (
    get_blog_files,
    get_districts_data,
    convert_division_string_for_scraping_data,
    markdown_to_html,
)
from App.weather.utils import get_weather_data
from App.config import DIT_CONFIG
from App.const import ENDPOINT
from App.ttc.utils import get_ttc_alerts


DATABASE_URL = os.environ.get("GTA_UPDATE_ALERTS_DB")
mail = Mail()


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
    mail.init_app(app)

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
            weather_data=get_weather_data(),
            ttc_alerts=get_ttc_alerts(),
        )

    from App.weather.weather_routes import weather_blueprint
    from App.ttc.ttc_routes import ttc_blueprint

    app.register_blueprint(weather_blueprint)
    app.register_blueprint(ttc_blueprint)

    @app.route(ENDPOINT.SUBSCRIBE, methods=["GET", "POST"])
    def subscribe():
        DISTRICT_DATA = get_districts_data()
        if request.method == "POST" and (
            current_app.config["ENVIRONMENT"] != "ENVIRONMENT_TYPE.PROD"
            or recaptcha.verify()
        ):
            return submit_form()
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
                    "INSERT INTO emails (email, districts, keywords, confirmed_email) VALUES (%s, %s, %s, FALSE) ON CONFLICT (email) DO UPDATE SET districts = EXCLUDED.districts, keywords = EXCLUDED.keywords",
                    (email, districts, keywords),
                )
                connection.commit()
                cursor.close()
                connection.close()
                send_verification_email(email)
                flash(
                    f"Please verify your email {email}.",
                    "success",
                )
                return redirect(url_for("index"))
            except:
                flash("Something went wrong. Have you already signed up?", "danger")
                return redirect(url_for("index"))
        else:
            return redirect(url_for("index"))

    def send_verification_email(email):
        msg = Message("Toronto Alerts - Verify Email", recipients=[email])
        token = base64.b64encode(email.encode("utf-8")).decode("utf-8")
        msg.body = f"{current_app.config.get('BACKEND_APP_URL')}/verify?token={token}"
        mail.send(msg)

    @app.get(ENDPOINT.VERIFY_EMAIL)
    def verify_email():
        token = request.args.get("token")
        email = base64.b64decode(token).decode("utf-8")
        if email:
            connection = get_db_connection()
            cursor = connection.cursor()
            cursor.execute(
                f"UPDATE emails SET confirmed_email = TRUE WHERE email = '{email}';",
            )
            connection.commit()
            cursor.close()
            connection.close()
            flash("User has been verified.", "success")
        else:
            flash("Invalid request", "error")
        return redirect(url_for("index"))

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
