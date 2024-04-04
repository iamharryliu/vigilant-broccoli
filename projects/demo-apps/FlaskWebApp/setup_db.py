from WebApp import create_app, db, bcrypt
from WebApp.models import Product, User, Post, Cart
import json
from json_placeholder import get_posts, get_users
from random import randint

DEFAULT_PASSWORD = "password"


def main():
    app = create_app()
    ctx = app.app_context()
    ctx.push()
    db.drop_all()
    db.create_all()
    create_superuser()
    create_products()


def create_superuser():
    hashed_password = bcrypt.generate_password_hash(DEFAULT_PASSWORD).decode("utf-8")
    user = User(
        username="harryliu", email="harryliu1995@gmail.com", password=hashed_password
    )
    db.session.add(user)
    cart = Cart(customer=user)
    db.session.add(cart)
    db.session.commit()
    return user


def create_products():
    with open("mock_products.json") as f:
        products = json.load(f)
        for product in products:
            product = Product(
                name=product["name"],
                code=product["code"],
                price=product["price"],
                description=product["description"],
                color=product["color"],
                image_file=product["image_file"],
            )
            db.session.add(product)
    db.session.commit()


def create_posts():
    num_of_users = User.query.count()
    posts = get_posts()
    for post in posts:
        user_id = randint(1, num_of_users)
        title = post["title"]
        content = post["body"]
        user = User.query.get(user_id)
        post = Post(title=title, content=content, author=user)
        db.session.add(post)
    db.session.commit()


def create_users():
    users = get_users()
    for user in users:
        hashed_password = bcrypt.generate_password_hash(DEFAULT_PASSWORD).decode(
            "utf-8"
        )
        user = User(
            username=user["username"], email=user["email"], password=hashed_password
        )
        db.session.add(user)
        cart = Cart(customer=user)
        db.session.add(cart)
    db.session.commit()


if __name__ == "__main__":
    main()
