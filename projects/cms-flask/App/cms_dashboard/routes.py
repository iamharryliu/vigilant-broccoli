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
from flask_login import login_required, current_user
from App.main.forms import ContentForm, UploadForm
from App.utils import (
    save_text,
    get_text_from_filepath,
    get_subdirectories,
    save_file,
    delete_directory,
)
from functools import wraps


def requires_privilege():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            app_name = kwargs.get("app_name")
            if not current_user.has_privilege(app_name):
                return redirect(url_for("cms.index"))
            return f(*args, **kwargs)

        return decorated_function

    return decorator


def get_filename(path):
    normalized_path = os.path.normpath(path)
    folder_name = os.path.basename(normalized_path)
    return folder_name


cms_dashboard_blueprint = Blueprint(
    "cms", __name__, template_folder="templates", url_prefix="/"
)


@cms_dashboard_blueprint.route("")
@login_required
def index():
    return redirect(url_for("cms.apps"))


@cms_dashboard_blueprint.route("apps")
@login_required
def apps():
    if len(current_user.privileges) == 1:
        return redirect(
            url_for(
                "cms.dashboard", app_name=current_user.privileges[0].application_type
            ),
        )
    privileges = [privilege.application_type for privilege in current_user.privileges]
    return render_template(
        "pages/apps_list.html", title="Apps List", privileges=privileges
    )


@cms_dashboard_blueprint.route("/<app_name>/dashboard")
@login_required
@requires_privilege()
def dashboard(app_name):
    return redirect(url_for("cms.page_content", app_name=app_name))


@cms_dashboard_blueprint.route(
    "/<app_name>/dashboard/page_content", methods=["GET", "POST"]
)
@login_required
@requires_privilege()
def page_content(app_name):
    form = ContentForm()
    filepath = f"{current_app.config['CONTENT_DIRECTORY']}/calendar.md"
    if request.method == "GET":
        form.content.data = get_text_from_filepath(filepath)
    if form.validate_on_submit():
        content = form.content.data
        save_text(content, filepath)
        flash(f"You have successfully updated the content.", "success")
        return redirect(url_for("cms.page_content"))
    return render_template(
        "pages/edit_content.html", title="Page Content", app_name=app_name, form=form
    )


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


@cms_dashboard_blueprint.route("/images/<album_name>/delete", methods=["POST"])
@login_required
def delete_album(album_name):
    delete_directory("images/" + album_name)
    return redirect(url_for("cms.images"))
