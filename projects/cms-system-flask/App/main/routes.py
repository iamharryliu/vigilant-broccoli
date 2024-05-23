from flask import Blueprint, redirect, render_template, url_for, request, flash
from flask_login import login_required, current_user
from App.main.utils import handle_contact_message
from App.main.forms import ContactForm, ContentForm
from App.utils import save_text, get_text

main_blueprint = Blueprint("main", __name__, template_folder="templates")


@main_blueprint.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))
    return redirect(url_for("users.login"))


@main_blueprint.route("/contact", methods=["GET", "POST"])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        handle_contact_message()
        return redirect(url_for("main.index"))
    return render_template("forms/contact_form.html", title="Contact", form=form)


@main_blueprint.route("/dashboard", methods=["GET", "POST"])
@login_required
def dashboard():
    form = ContentForm()
    if request.method == "GET":
        form.content.data = get_text()
    if form.validate_on_submit():
        content = form.content.data
        save_text(content)
        flash(f"You have successfully updated the content.", "success")
        return redirect(url_for("main.dashboard"))
    return render_template("dashboard.html", title="Dashboard", form=form)
