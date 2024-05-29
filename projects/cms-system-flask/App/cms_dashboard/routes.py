import os
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
from App.utils import save_text, get_text, get_subdirectories
from App.utils import save_file


def get_filename(path):
    normalized_path = os.path.normpath(path)
    folder_name = os.path.basename(normalized_path)
    return folder_name


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
    return render_template("pages/edit_content.html", title="Page Content", form=form)


@cms_dashboard_blueprint.route("/images", methods=["GET", "POST"])
@login_required
def images():
    directories = [get_filename(path) for path in get_subdirectories("images/")]
    form = UploadForm()
    if form.validate_on_submit():
        directory_name = form.directory_name.data.strip()
        files = form.images.data
        for file in files:
            save_file(file, f"images/{directory_name}/{file.filename}")
        flash(f"You have successfully uploaded {directory_name}.", "success")
        return redirect(url_for("cms.images"))
    return render_template(
        "pages/upload.html", title="Images", form=form, directories=directories
    )


@cms_dashboard_blueprint.route("/images/<album_name>", methods=["GET", "POST"])
@login_required
def image_album(album_name):
    return render_template(
        "pages/edit_image_album.html", title="Edit Album", album_name=album_name
    )
