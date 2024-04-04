from flask import session, request
from flask_login import current_user
from WebApp import db
from WebApp.models import Product, Item, Cart, Order
from WebApp.store.forms import ItemForm, CheckoutForm


import random, string


# Create


def create_anon_cart():
    if "cart" not in session:
        cart = {"total": 0, "cart_items": []}
        session["cart"] = cart


def add_item_to_cart(product):
    if current_user.is_authenticated:
        add_item_to_user_cart(product)
    else:
        add_item_to_anon_cart(product)


def add_item_to_user_cart(product):
    form = ItemForm()
    cart = current_user.carts[0]
    cart_item = (
        Item.query.filter_by(cart_id=cart.id)
        .filter_by(product_id=product.id)
        .filter_by(size=form.size.data)
        .first()
    )
    if cart_item:
        cart_item.quantity = form.quantity.data
    else:
        cart_item = Item(
            cart_id=cart.id,
            product_id=product.id,
            quantity=form.quantity.data,
            size=form.size.data,
        )
        db.session.add(cart_item)
    db.session.commit()


def add_item_to_anon_cart(product):
    form = ItemForm()
    quantity = form.quantity.data
    size = form.size.data
    session["cart"]["cart_items"].append(
        {
            "product": {
                "name": product.name,
                "code": product.code,
                "color": product.color,
                "image_file": product.image_file,
                "price": product.price,
                "description": product.description,
            },
            "quantity": int(quantity),
            "size": size,
            "id": "".join(
                [random.choice(string.ascii_letters + string.digits) for n in range(32)]
            ),
        }
    )


# Read


def get_all_products():
    products = Product.query.all()
    return products


def get_product(id):
    product = Product.query.get_or_404(id)
    return product


def search_products(search):
    products = Product.query.filter(
        Product.name.like(f"%{search}%")
        | Product.description.like(f"%{search}%")
        | Product.color.like(f"%{search}%")
        | Product.description.like(f"%{search}%")
        | Product.code.like(f"%{search}%")
    )
    return products


def get_cart_items_query():
    cart = current_user.carts[0]
    return Item.query.filter_by(cart_id=cart.id)


def get_list_of_cart_items():
    if current_user.is_authenticated:
        items = get_cart_items_query()
        items = items.all()
    else:
        items = session["cart"]["cart_items"]
    return items


def get_cart_and_cart_item_with_total_and_quantity():
    if current_user.is_authenticated:
        cart = current_user.carts[0]
        cart_items = get_list_of_cart_items()
        cart.total = 0
        cart.quantity = 0
        for item in cart_items:
            cart.total += item.product.price * float(item.quantity)
            cart.quantity += item.quantity
    else:
        create_anon_cart()
        cart = session["cart"]
        cart_items = cart["cart_items"]
        cart_total = 0
        cart_quantity = 0
        for item in cart_items:
            cart_total += item["quantity"] * item["product"]["price"]
            cart_quantity += item["quantity"]
        cart["total"] = cart_total
        cart["quantity"] = cart_quantity
    return cart, cart_items


def get_cart_item(item_id):
    if current_user.is_authenticated:
        return Item.query.filter_by(id=item_id).first_or_404()
    else:
        return next(
            (item for item in session["cart"]["cart_items"] if item["id"] == item_id),
            None,
        )


def get_cart_item_and_form(item_id):
    form = ItemForm()
    if current_user.is_authenticated:
        item = get_cart_item(item_id)
        form.quantity.data = str(item.quantity)
        print(item.quantity, item.size)
        form.size.data = item.size
    else:
        item = get_cart_item(item_id)
        form.quantity.data = str(item["quantity"])
        form.size.data = item["size"]
    return item, form


# Update


def update_cart_items():
    if current_user.is_authenticated:
        items = get_cart_items_query().order_by(Item.id.desc()).all()
        ids = request.form.keys()
        for _id in ids:
            for item in items:
                if item.id == int(_id):
                    item.quantity = int(int(request.form[_id]))
        db.session.commit()
    else:
        ids = request.form.keys()
        for _id in ids:
            for item in session["cart"]["cart_items"]:
                if item["id"] == _id:
                    item["quantity"] = int(request.form[item["id"]])


def update_cart_item(item):
    form = ItemForm()
    if current_user.is_authenticated:
        item.quantity = int(form.quantity.data)
        item.size = form.size.data
        db.session.commit()
    else:
        item["quantity"] = int(form.quantity.data)
        item["size"] = form.size.data
        session["cart"]["cart_items"][:] = [
            other_item
            for other_item in session["cart"]["cart_items"]
            if other_item["id"] != item["id"]
        ]
        session["cart"]["cart_items"].append(item)


# Delete


def delete_cart_item(item_id):
    if current_user.is_authenticated:
        item = get_cart_item(item_id)
        db.session.delete(item)
        db.session.commit()
    else:
        items = session["cart"]["cart_items"]
        session["cart"]["cart_items"] = [
            item for item in items if item["id"] != item_id
        ]


def delete_all_cart_items():
    if current_user.is_authenticated:
        cart_items = get_cart_items_query()
        cart_items.delete()
        db.session.commit()
    else:
        session["cart"]["cart_items"] = []


def delete_all_cart_items_anon():
    session["cart"]["cart_items"] = []


def process_order():
    # user = current_user
    # cart = Cart(customer=user)
    # send_order_email()
    form = CheckoutForm()
    newsletter_sub = form.newsletter_sub.data
    order = Order(
        email=form.email.data,
        shipping_first_name=form.shipping_first_name.data,
        shipping_last_name=form.shipping_last_name.data,
        shipping_address=form.shipping_address.data,
        shipping_address_unit=form.shipping_address_unit.data,
        shipping_city=form.shipping_city.data,
        shipping_region=form.shipping_region.data,
        shipping_country=form.shipping_country.data,
        shipping_postal_code=form.shipping_postal_code.data,
        shipping_phone_number=form.shipping_phone_number.data,
        shipping_method=form.shipping_method.data,
        card_number=form.card_number.data,
        card_name=form.card_name.data,
        card_expiration_month=form.card_expiration_month.data,
        card_expiration_year=form.card_expiration_year.data,
        billing_first_name=form.billing_first_name.data,
        billing_last_name=form.billing_last_name.data,
        billing_address=form.billing_address.data,
        billing_address_unit=form.billing_address_unit.data,
        billing_city=form.billing_city.data,
        billing_region=form.billing_region.data,
        billing_country=form.billing_country.data,
        billing_postal_code=form.billing_postal_code.data,
        billing_phone_number=form.billing_phone_number.data,
    )
    if current_user.is_authenticated:
        order.customer = current_user
    db.session.add(order)
    db.session.commit()


def send_order_email():
    pass
