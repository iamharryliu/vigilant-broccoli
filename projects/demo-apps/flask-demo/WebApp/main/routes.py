from flask import Blueprint, flash, redirect, render_template, url_for
from WebApp.main.utils import handle_contact_message
from WebApp.main.forms import ContactForm

main = Blueprint("main", __name__, template_folder="templates")


@main.route("/")
def home():
    return render_template(
        "main_index.html",
        title="Index",
    )


@main.route("/contact", methods=["GET", "POST"])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        handle_contact_message()
        flash(f"Your message has been sent.", "success")
        return redirect(url_for("main.home"))
    return render_template("forms/contact_form.html", title="Contact", form=form)
