import base64
import os
from flask import (
    Blueprint,
    render_template,
    current_app,
    request,
    flash,
    redirect,
    url_for,
)
from App import db, recaptcha
from App.utils import (
    get_districts_data,
    convert_division_string_for_scraping_data,
)
from App.const import ENDPOINT
from App.models import Subscription
from App.utils import get_blog_files, markdown_to_html, send_verification_email
from App.weather.utils import get_weather_data
from App.ttc.utils import get_ttc_alerts
from scripts.utils import get_parsed_x_hours_of_alerts


DATABASE_URL = os.environ.get("TORONTO_ALERTS_DB")
main_blueprint = Blueprint("main", __name__, url_prefix="", template_folder="templates")


@main_blueprint.route(ENDPOINT.INDEX, methods=["GET", "POST"])
def index():
    # blogs = get_blog_files()
    blogs = []
    return render_template(
        "pages/home-page/index.html",
        blogs=blogs,
        weather_data=get_weather_data(),
        ttc_alerts=get_ttc_alerts(),
        gta_updates=get_parsed_x_hours_of_alerts(hours=0.25),
    )


@main_blueprint.route(ENDPOINT.DASHBOARD)
def dashboard():
    return render_template(
        "pages/dashboard.html",
        weather_data=get_weather_data(),
        ttc_alerts=get_ttc_alerts(),
        gta_updates=get_parsed_x_hours_of_alerts(hours=0.5),
    )


@main_blueprint.route(ENDPOINT.SUBSCRIBE, methods=["GET", "POST"])
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
            subscription = Subscription.query.filter_by(email=email).first()
            if subscription:
                db.session.delete(subscription)
            subscription = Subscription(
                email=email,
                districts=districts,
                keywords=keywords,
            )
            db.session.add(subscription)
            send_verification_email(email)
            flash(
                f"Please verify your email {email}.",
                "success",
            )
        except:
            flash("Something went wrong.", "danger")
            return redirect(url_for("main.subscribe"))
    return redirect(url_for("main.index"))


@main_blueprint.get(ENDPOINT.VERIFY_EMAIL)
def verify_email():
    token = request.args.get("token")
    subscription = base64.b64decode(token).decode("utf-8")
    if subscription:
        subscription = Subscription.query.filter_by(email=subscription).one_or_none()
        if subscription:
            subscription.confirmed_email = True
            db.session.commit()
            flash("User has been verified.", "success")
        else:
            flash(f"Email not found.", "danger")
    else:
        flash("Invalid request", "error")
    return redirect(url_for("main.index"))


@main_blueprint.get(ENDPOINT.UNSUBSCRUBE)
def unsubscribe():
    email = request.args.get("email")
    if email:
        try:
            subscription = Subscription.query.filter_by(email=email).one_or_none()
            if subscription:
                db.session.delete(subscription)
                db.session.commit()
                flash(f"You have successfully unsubscribed {email}.", "success")
                return redirect(url_for("main.index"))
            else:
                flash(f"Email not found.", "danger")
                return redirect(url_for("main.index"))
        except:
            flash("Something went wrong.")
            return redirect(url_for("main.index"))
    else:
        return redirect(url_for("main.index"))


@main_blueprint.get(ENDPOINT.BLOGS)
def blogs():
    blogs = get_blog_files()
    return render_template("pages/blogs-directory.html", title="Blogs", blogs=blogs)


@main_blueprint.get(ENDPOINT.BLOG)
def blog():
    blog_content = get_blog_files()[0]["content"]
    return render_template(
        "pages/blog-page.html",
        title="Blog Name",
        blog_content=markdown_to_html(blog_content),
    )


@main_blueprint.get(ENDPOINT.MORE)
def more():
    return render_template(
        "pages/more-page.html",
        title="More",
    )
