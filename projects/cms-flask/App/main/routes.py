from flask import (
    Blueprint,
    redirect,
    render_template,
    url_for,
)
from flask_login import current_user
from App.main.utils import handle_contact_message
from App.main.forms import ContactForm

main_blueprint = Blueprint("main", __name__, template_folder="templates")


@main_blueprint.route("/contact", methods=["GET", "POST"])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        handle_contact_message()
        return redirect(url_for("main.contact"))
    return render_template("forms/contact_form.html", title="Contact", form=form)
