from flask import (
    Blueprint,
    redirect,
    render_template,
    url_for,
    request,
    flash,
    current_app,
)
from flask_login import login_required
from App.main.forms import ContentForm, UploadForm
from App.utils import save_text, get_text
from App.utils import save_file

cms_dashboard_blueprint = Blueprint(
    "cms", __name__, template_folder="templates", url_prefix="/cms"
)


@cms_dashboard_blueprint.route("")
@login_required
def dashboard():
    return redirect(url_for("cms.page_content"))


@cms_dashboard_blueprint.route("page_content", methods=["GET", "POST"])
@login_required
def page_content():
    form = ContentForm()
    if request.method == "GET":
        form.content.data = get_text(
            f"{current_app.config['CONTENT_DIRECTORY']}/calendar.md"
        )
    if form.validate_on_submit():
        content = form.content.data
        save_text(content, f"{current_app.config['CONTENT_DIRECTORY']}/calendar.md")
        flash(f"You have successfully updated the content.", "success")
        return redirect(url_for("cms.dashboard"))
    return render_template(
        "pages/edit_calendar_page.html", title="Page Content", form=form
    )


@cms_dashboard_blueprint.route("/images", methods=["GET", "POST"])
@login_required
def images():
    form = UploadForm()
    if form.validate_on_submit():
        directory_name = form.directory_name.data.strip()
        files = form.images.data
        for file in files:
            save_file(file, f"images/{directory_name}/{file.filename}")
        flash(f"You have successfully uploaded the {directory_name}.", "success")
        return redirect(url_for("cms.images"))
    return render_template("pages/upload.html", title="Images", form=form)