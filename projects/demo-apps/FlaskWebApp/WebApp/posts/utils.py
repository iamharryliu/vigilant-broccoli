from flask import request, url_for
from flask_login import current_user
from WebApp import db
from WebApp.models import Post, User
from WebApp.posts.forms import PostForm

per_page = 10

# Create


def add_post():
    form = PostForm()
    post = Post(title=form.title.data, content=form.content.data, author=current_user)
    db.session.add(post)
    db.session.commit()


# Read


def get_paginated_posts():
    posts = Post.query
    paginated_posts = sort_and_paginate(posts)
    return paginated_posts


def get_paginated_search_posts(search_string):
    posts = get_search_posts(search_string)
    paginated_posts = sort_and_paginate(posts)
    return paginated_posts


def get_search_posts(search_string):
    search_posts = Post.query.join(User).filter(
        User.username.like(f"%{search_string}%")
        | Post.title.like(f"%{search_string}%")
        | Post.content.like(f"%{search_string}%")
    )
    return search_posts


def get_paginated_user_posts(user):
    posts = get_user_posts(user)
    paginated_posts = sort_and_paginate(posts)
    return paginated_posts


def get_user_posts(user):
    posts = Post.query.filter_by(author=user)
    return posts


def get_post(post_id):
    posts_query = Post.query
    post = posts_query.get_or_404(post_id)
    return post


def sort_and_paginate(posts):
    posts = sort(posts)
    posts = paginate(posts)
    return posts


def sort(posts):
    return posts.order_by(Post.date_posted.desc())


def paginate(posts):
    page = request.args.get("page", 1, type=int)
    return posts.paginate(page=page, per_page=per_page)


# Update


def update_post(post):
    form = PostForm()
    post.title = form.title.data
    post.content = form.content.data
    db.session.commit()


# Delete


def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.author != current_user:
        abort(401)
    db.session.delete(post)
    db.session.commit()


# Other


def get_redirects(search_string=None, post_id=None, username=None):
    redirect_dict = dict()
    page_query = (
        f"?page={str(request.args.get('page'))}" if request.args.get("page") else ""
    )
    endpoint = request.endpoint
    if endpoint == "posts.posts":
        endpoint_url = url_for(request.endpoint)
        redirect_dict["create"] = f"{endpoint_url}"
        redirect_dict["update"] = f"{endpoint_url}{page_query}"
        redirect_dict["delete"] = f"{endpoint_url}{page_query}"
    elif search_string:
        endpoint_url = url_for(request.endpoint, search_string=search_string)
        redirect_dict["create"] = url_for("posts.posts")
        redirect_dict["update"] = f"{endpoint_url}{page_query}"
        redirect_dict["delete"] = f"{endpoint_url}{page_query}"
    elif post_id:
        endpoint_url = url_for(request.endpoint, post_id=post_id)
        redirect_dict["create"] = url_for("posts.posts")
        redirect_dict["update"] = f"{endpoint_url}{page_query}"
        redirect_dict["delete"] = url_for("posts.posts")
    elif username:
        endpoint_url = url_for(request.endpoint, username=username)
        redirect_dict["create"] = f"{endpoint_url}"
        redirect_dict["update"] = f"{endpoint_url}{page_query}"
        redirect_dict["delete"] = f"{endpoint_url}{page_query}"
    return redirect_dict
