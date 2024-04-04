from flask import Blueprint, render_template, url_for, redirect, request, flash
from WebApp.posts.forms import PostForm
from WebApp.posts.utils import (
    add_post,
    get_paginated_posts,
    get_paginated_search_posts,
    get_post,
    update_post,
    delete_post,
    get_redirects,
)

posts_blueprint = Blueprint(
    "posts", __name__, url_prefix="/posts", template_folder="templates"
)

# Create


@posts_blueprint.route("/add", methods=["POST"])
def add_post_route():
    form = PostForm()
    if form.validate_on_submit():
        add_post()
        flash("Post has been created.", "success")
        return redirect(request.form["url"])


# Read


@posts_blueprint.route("", methods=["GET", "POST"])
def posts():
    create_post_form = PostForm()
    if create_post_form.validate_on_submit():
        add_post()
        return redirect(request.form["url"])
    posts = get_paginated_posts()
    update_post_form = PostForm()
    redirect_dict = get_redirects()
    return render_template(
        "posts/posts/view.html",
        title="Posts",
        create_post_form=create_post_form,
        update_post_form=update_post_form,
        create_redirect=redirect_dict["create"],
        update_redirect=redirect_dict["update"],
        delete_redirect=redirect_dict["delete"],
        posts=posts,
    )


@posts_blueprint.route("/search", methods=["POST"])
def search():
    if request.method == "POST":
        search_string = request.form["search"]
    return redirect(url_for("posts.get_search", search_string=search_string))


@posts_blueprint.route("/search/<string:search_string>", methods=["GET"])
def get_search(search_string):
    posts = get_paginated_search_posts(search_string)
    create_post_form = PostForm()
    update_post_form = PostForm()
    redirect_dict = get_redirects(search_string=search_string)
    return render_template(
        "posts/posts/view.html",
        title="Posts",
        create_post_form=create_post_form,
        update_post_form=update_post_form,
        create_redirect=redirect_dict["create"],
        update_redirect=redirect_dict["update"],
        delete_redirect=redirect_dict["delete"],
        posts=posts,
        search_string=search_string,
    )


@posts_blueprint.route("/<int:post_id>", methods=["GET"])
def post(post_id):
    post = get_post(post_id)
    create_post_form = PostForm()
    update_post_form = PostForm()
    update_post_form.title.data = post.title
    update_post_form.content.data = post.content
    redirect_dict = get_redirects(post_id=post_id)
    return render_template(
        "posts/post/view.html",
        title=post.title,
        create_post_form=create_post_form,
        update_post_form=update_post_form,
        create_redirect=redirect_dict["create"],
        update_redirect=redirect_dict["update"],
        delete_redirect=redirect_dict["delete"],
        post=post,
    )


# Update


@posts_blueprint.route("/<int:post_id>/update", methods=["POST"])
def update_post_route(post_id):
    post = get_post(post_id)
    update_post_form = PostForm()
    if update_post_form.validate_on_submit():
        update_post(post)
        flash("Post has been updated.", "success")
        return redirect(request.form["url"])


# Delete


@posts_blueprint.route("/<int:post_id>/delete", methods=["POST"])
def delete_post_route(post_id):
    delete_post(post_id)
    flash("Post has been deleted.", "success")
    return redirect(request.form["url"])
