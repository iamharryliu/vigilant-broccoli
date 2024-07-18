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
from App import db, bcrypt
from App.models import User, Application
from App.main.forms import (
    ContentForm,
    UploadForm,
    CreateUserForm,
    UpdateUserForm,
    CreateAppForm,
)
from App.utils import (
    save_text,
    get_text_from_filepath,
    get_subdirectories,
    save_file,
    delete_directory,
)
from App.const import FLASH_CATEGORY, USER_TYPE
from functools import wraps


def requires_privilege():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            app_name = kwargs.get("app_name")
            if (
                current_user.user_type == USER_TYPE.SYSTEM_ADMIN
                or current_user.has_privilege(app_name)
            ):
                return f(*args, **kwargs)
            flash("You do not have permission.", FLASH_CATEGORY.WARNING)
            return redirect(url_for("cms.index"))

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


@cms_dashboard_blueprint.route("users")
@login_required
def users():
    users = User.query.all()
    return render_template("pages/users_list.html", title="Apps List", users=users)


@cms_dashboard_blueprint.route("users/<username>", methods=["GET", "POST"])
@login_required
def user_details(username):
    user = User.query.filter_by(username=username).first()
    form = UpdateUserForm()
    if form.validate_on_submit():
        try:
            user.username = form.username.data
            user.email = form.email.data
            db.session.commit()

            flash("Successful user update.", "success")
        except:
            flash("Unsuccessful user update.", "danger")
        return redirect(url_for("cms.user_details", username=username))
    form.username.data = user.username
    form.email.data = user.email
    return render_template(
        "pages/user_details.html",
        title=f"User Details - {username}",
        user=user,
        form=form,
    )


@cms_dashboard_blueprint.route("users/<username>/delete", methods=["POST"])
@login_required
def delete_user(username):
    user = User.query.filter_by(username=username).first()
    if user:
        db.session.delete(user)
        db.session.commit()
        flash(f"User {username} has been deleted.", "success")
    else:
        flash(f"User {username} not found.", "danger")
    return redirect(url_for("cms.users"))


@cms_dashboard_blueprint.route("/users/create_user", methods=["GET", "POST"])
@login_required
def create_user():
    form = CreateUserForm()
    if form.validate_on_submit():
        try:
            hashed_password = bcrypt.generate_password_hash(form.password.data).decode(
                "utf-8"
            )
            user = User(
                username=form.username.data,
                email=form.email.data,
                password=hashed_password,
            )
            db.session.add(user)
            db.session.commit()
            flash("User has been added successfully!", "success")
            return redirect(url_for("cms.users"))
        except:
            flash("Unsuccessful user registration.", "danger")
            return redirect(url_for("cms.create_user"))
    return render_template(
        "pages/create_user_page.html", title="Create User", form=form
    )


@cms_dashboard_blueprint.route("/apps/create_app", methods=["GET", "POST"])
@login_required
def create_app():
    form = CreateAppForm()
    if form.validate_on_submit():
        try:
            app = Application(name=form.name.data)
            db.session.add(app)
            db.session.commit()
            flash("App has been added successfully!", "success")
            return redirect(url_for("cms.apps"))
        except:
            flash("Unsuccessful app creation.", "danger")
            return redirect(url_for("cms.create_app"))
    return render_template("pages/create_app_page.html", title="Create App", form=form)


@cms_dashboard_blueprint.route("apps")
@login_required
def apps():
    apps = []
    if current_user.user_type == USER_TYPE.SYSTEM_ADMIN:
        apps = [app.name for app in Application.query.all()]
    if len(current_user.user_applications) == 1:
        return redirect(
            url_for("cms.dashboard", app_name=current_user.user_applications[0].name),
        )
    return render_template("pages/apps_list.html", title="Apps List", apps=apps)


@cms_dashboard_blueprint.route("apps/<app_name>/delete", methods=["POST"])
@login_required
def delete_app(app_name):
    application = Application.query.filter_by(name=app_name).first()
    if application:
        db.session.delete(application)
        db.session.commit()
        flash(f"Application {app_name} has been deleted.", "success")
    else:
        flash(f"Application {app_name} not found.", "danger")
    return redirect(url_for("cms.apps"))


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
        return redirect(url_for("cms.page_content", app_name=app_name))
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
