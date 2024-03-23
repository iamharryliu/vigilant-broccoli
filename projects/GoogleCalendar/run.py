import os
from flask import Flask, render_template, redirect, url_for
from google_calendar import calendar_api
from utils import get_today, get_monday_this_week_dt, get_one_week_from_dt
from forms import CredentialForm

app = Flask(__name__)
app.config["SECRET_KEY"] = "5791628bb0b13ce0c676dfde280ba245"


@app.route("/")
def index():
    if os.path.isfile("./credentials.json"):
        yourcalendar = calendar_api()
        day_data = yourcalendar.get_pie_chart_data_for_day()
        week_data = yourcalendar.get_pie_chart_data_for_week()
        column_chart = yourcalendar.get_column_chart_data_for_next_x_weeks(4)
        today = get_today()
        monday = get_monday_this_week_dt()
        next_week_monday = get_one_week_from_dt(monday)
        return render_template(
            "index.html",
            day_data=day_data,
            week_data=week_data,
            column_chart=column_chart,
            today=today,
            monday=monday,
            next_week_monday=next_week_monday,
        )
    else:
        return redirect(url_for("credential_form"))


@app.route("/credential_form", methods=["GET", "POST"])
def credential_form():
    form = CredentialForm()
    if form.validate_on_submit():
        form.credential.data.save("./credentials.json")
        return redirect(url_for("index"))
    return render_template("credential_form.html", form=form)


if __name__ == "__main__":
    app.run(debug=True)
