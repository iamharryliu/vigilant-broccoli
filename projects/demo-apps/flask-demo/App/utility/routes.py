from flask import Blueprint, redirect, render_template, url_for
from App.main.utils import handle_contact_message
from App.main.forms import ContactForm

utility_blueprint = Blueprint("utility", __name__, template_folder="templates")


@utility_blueprint.route("/contact", methods=["GET", "POST"])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        handle_contact_message()
        return redirect(url_for("main.index"))
    return render_template("forms/contact_form.html", title="Contact", form=form)
