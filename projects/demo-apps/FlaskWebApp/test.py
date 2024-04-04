import json
import requests
import unittest
from unittest.mock import patch

from WebApp import create_app, db, bcrypt
from WebApp.models import Product, User, Post, Cart, Item, Order


class TestClass(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app = create_app()
        ctx = app.app_context()
        ctx.push()
        db.drop_all()
        db.create_all()
        create_users()
        create_products()

    @classmethod
    def tearDownClass(cls):
        db.session.commit()

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_cart(self):
        for user in User.query.all():
            cart = user.carts[0]
            for product in Product.query.all():
                cart_item = Item(cart_id=cart.id, product_id=product.id, size="Small")
                db.session.add(cart_item)
            order = Order(
                customer=user,
                checkout_cart=cart,
                email=default_order_info["email"],
                shipping_first_name=default_order_info["shipping_first_name"],
                shipping_last_name=default_order_info["shipping_last_name"],
                shipping_address=default_order_info["shipping_address"],
                shipping_address_unit=default_order_info["shipping_address_unit"],
                shipping_city=default_order_info["shipping_city"],
                shipping_region=default_order_info["shipping_region"],
                shipping_country=default_order_info["shipping_country"],
                shipping_postal_code=default_order_info["shipping_postal_code"],
                shipping_phone_number=default_order_info["shipping_phone_number"],
                shipping_method=default_order_info["shipping_method"],
                card_number=default_order_info["card_number"],
                card_name=default_order_info["card_name"],
                card_expiration_month=default_order_info["card_expiration_month"],
                card_expiration_year=default_order_info["card_expiration_year"],
                billing_first_name=default_order_info["billing_first_name"],
                billing_last_name=default_order_info["billing_last_name"],
                billing_address=default_order_info["billing_address"],
                billing_address_unit=default_order_info["billing_address_unit"],
                billing_city=default_order_info["billing_city"],
                billing_region=default_order_info["billing_region"],
                billing_country=default_order_info["billing_country"],
                billing_postal_code=default_order_info["billing_postal_code"],
                billing_phone_number=default_order_info["billing_phone_number"],
            )
            db.session.add(order)


test_users = [
    {"username": "johndoe", "email": "johndoe@gmail.com", "password": "password"},
    {"username": "janedoe", "email": "janedoe@gmail.com", "password": "password"},
]


def create_users():
    for user in test_users:
        hashed_password = bcrypt.generate_password_hash(user["password"]).decode(
            "utf-8"
        )
        user = User(
            username=user["username"], email=user["email"], password=hashed_password
        )
        db.session.add(user)
        cart = Cart(customer=user)
        db.session.add(cart)
        db.session.commit()


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


default_order_info = {
    "email": "johndoe@email.com",
    "shipping_first_name": "John",
    "shipping_last_name": "Doe",
    "shipping_address": "Jane Street",
    "shipping_address_unit": "21",
    "shipping_city": "Toronto",
    "shipping_region": "Ontario",
    "shipping_country": "Canada",
    "shipping_postal_code": "M1E XXX",
    "shipping_phone_number": "647-000-0000",
    "shipping_method": "Standard",
    "card_number": "4724000000000000",
    "card_name": "John Doe",
    "card_expiration_month": "02",
    "card_expiration_year": "02",
    "billing_first_name": "John",
    "billing_last_name": "Doe",
    "billing_address": "Jane Street",
    "billing_address_unit": "21",
    "billing_city": "Toronto",
    "billing_region": "Ontario",
    "billing_country": "Canada",
    "billing_postal_code": "M1E XXX",
    "billing_phone_number": "647-000-0000",
}


if __name__ == "__main__":
    unittest.main()
