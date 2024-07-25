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
from App.models import User, Application, Group
from App.main.forms import (
    ContentForm,
    UploadForm,
    CreateUserForm,
    UpdateUserForm,
    CreateAppForm,
    UpdateAppForm,
    CreateGroupForm,
)
from App.utils import (
    save_text,
    get_text_from_filepath,
    get_subdirectories,
    save_file,
    delete_directory,
    generate_password,
)
from App.const import FLASH_CATEGORY, USER_TYPE
from functools import wraps


def requires_privilege(fn):
    @wraps(fn)
    def decorated_function(*args, **kwargs):
        print("hit")
        app_name = (
            kwargs.get("app_name")
            or request.args.get("app_name")
            or request.form.get("app_name")
        )
        if (
            current_user.user_type == USER_TYPE.SYSTEM_ADMIN
            or current_user.has_privilege(app_name)
        ):
            return fn(*args, **kwargs)
        flash("You do not have permission.", FLASH_CATEGORY["WARNING"])
        return redirect(url_for("cms.index"))

    return decorated_function


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
            hashed_password = generate_password(form.password.data)
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
    if current_user.user_type == USER_TYPE.SYSTEM_ADMIN:
        apps = [app.name for app in Application.query.all()]
    elif current_user.count_applications() == 1:
        return redirect(
            url_for("cms.dashboard", app_name=current_user.get_applications()[0].name),
        )
    else:
        apps = current_user.get_applications()
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
@requires_privilege
def dashboard(app_name):
    return redirect(url_for("cms.page_content", app_name=app_name))


@cms_dashboard_blueprint.route("/<app_name>/settings", methods=["GET", "POST"])
@login_required
@requires_privilege
def app_settings(app_name):
    updateAppForm = UpdateAppForm()
    updateAppForm.name.data = app_name
    createGroupForm = CreateGroupForm()
    createGroupForm.application.data = app_name
    app = Application.query.filter_by(name=app_name).first()
    user_groups = app.groups
    return render_template(
        "pages/app_settings_page.html",
        app_name=app_name,
        user_groups=user_groups,
        updateAppForm=updateAppForm,
        createGroupForm=createGroupForm,
        active_tab="settings",
    )


@cms_dashboard_blueprint.route("/<app_name>/update_app_name", methods=["POST"])
@login_required
def update_app_name(app_name):
    form = UpdateAppForm(request.form)
    app = Application.query.filter_by(name=app_name).first()
    if form.validate_on_submit():
        try:
            app.name = form.name.data
            db.session.commit()
            flash("Successfully updated name.", "success")
            return redirect(url_for("cms.app_settings", app_name=app.name))
        except:
            flash("Unsuccessfully updated name.", "danger")
    return redirect(url_for("cms.app_settings", app_name=app_name))


@cms_dashboard_blueprint.route("/<app_name>/create_user_group", methods=["POST"])
@login_required
def create_user_group(app_name):
    form = CreateGroupForm(request.form)
    app = Application.query.filter_by(name=form.application.data).first()
    if form.validate_on_submit():
        try:
            user_group = Group(name=form.name.data)
            db.session.add(user_group)
            app.groups.append(user_group)
            db.session.commit()
            flash("User group has been added successfully!", "success")
        except:
            flash("Unsuccessful user group creation.", "danger")
    return redirect(url_for("cms.app_settings", app_name=app_name))


@cms_dashboard_blueprint.route(
    "/<app_name>/user_group/<user_group_name>", methods=["GET", "POST"]
)
@login_required
def user_group_details(app_name, user_group_name):
    group = Group.query.filter_by(name=user_group_name).first()
    form = CreateUserForm()
    if form.validate_on_submit():
        try:
            hashed_password = generate_password(form.password.data)
            user = User(
                username=form.username.data,
                email=form.email.data,
                password=hashed_password,
            )
            db.session.add(user)
            group.users.append(user)
            db.session.commit()
            flash("User has been added successfully!", "success")
            return redirect(
                url_for(
                    "cms.user_group_details",
                    app_name=app_name,
                    user_group_name=user_group_name,
                )
            )
        except:
            flash("Unsuccessful user registration.", "danger")
            return redirect(
                url_for(
                    "cms.user_group_details",
                    app_name=app_name,
                    user_group_name=user_group_name,
                )
            )
    return render_template(
        "pages/user_group_details_page.html",
        title="Page Content",
        app_name=app_name,
        user_group=group,
        form=form,
    )


@cms_dashboard_blueprint.route("user_groups/<user_group_name>/delete", methods=["POST"])
@login_required
def delete_user_group(user_group_name):
    user_group = Group.query.filter_by(name=user_group_name).first()
    if user_group:
        db.session.delete(user_group)
        db.session.commit()
        flash(f"User group {user_group.name} has been deleted.", "success")
    else:
        flash(f"User group {user_group_name} not found.", "danger")
    return redirect(
        url_for("cms.app_settings", app_name=user_group.applications[0].name)
    )


@cms_dashboard_blueprint.route(
    "/<app_name>/dashboard/page_content", methods=["GET", "POST"]
)
@login_required
@requires_privilege
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
        "pages/edit_content.html",
        title="Page Content",
        app_name=app_name,
        form=form,
        active_tab="page_content",
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
