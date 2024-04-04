from flask import Blueprint, render_template, redirect, url_for, abort, request, flash
from flask_login import current_user
from WebApp.models import Cart
from WebApp.store.forms import ItemForm, CheckoutForm
from WebApp.store.utils import (
    get_all_products,
    get_product,
    search_products,
    add_item_to_cart,
    get_cart_and_cart_item_with_total_and_quantity,
    get_cart_item_and_form,
    get_list_of_cart_items,
    update_cart_items,
    update_cart_item,
    delete_cart_item,
    delete_all_cart_items,
    process_order,
)


store_blueprint = Blueprint(
    "store", __name__, url_prefix="/store", template_folder="templates"
)


@store_blueprint.route("search", methods=["GET", "POST"])
def search():
    search = request.form["search"]
    products = search_products(search)
    return render_template("store/products.html", title="Store", products=products)


@store_blueprint.route("")
def products():
    products = get_all_products()
    return render_template("store/products.html", title="Store", products=products)


@store_blueprint.route("<int:product_id>", methods=["GET", "POST"])
def product(product_id):
    product = get_product(product_id)
    form = ItemForm()
    if form.validate_on_submit():
        add_item_to_cart(product)
        flash(
            f"{form.quantity.data} x {product.name} ({form.size.data}) added to your cart.",
            "success",
        )
        return redirect(url_for("store.products", product_id=product_id))
    return render_template(
        "store/product-item.html", title=product.name, product=product, form=form
    )


@store_blueprint.route("cart")
def cart():
    cart, cart_items = get_cart_and_cart_item_with_total_and_quantity()
    return render_template(
        "store/cart.html", title="Cart", cart=cart, cart_items=cart_items
    )


@store_blueprint.route("cart/update", methods=["POST"])
def cart_update():
    update_cart_items()
    return redirect(url_for("store.cart"))


@store_blueprint.route("cart/<item_id>", methods=["GET", "POST"])
def cart_item_update(item_id):
    item, form = get_cart_item_and_form(item_id)
    if form.validate_on_submit():
        update_cart_item(item)
        return redirect(url_for("store.cart"))
    return render_template(
        "store/product-item.html", title="Edit Cart Item", item=item, form=form
    )


@store_blueprint.route("cart/<item_id>/delete", methods=["POST"])
def cart_delete_item(item_id):
    delete_cart_item(item_id)
    return redirect(url_for("store.cart"))


@store_blueprint.route("cart/clear", methods=["POST"])
def cart_clear():
    delete_all_cart_items()
    return redirect(url_for("store.cart"))


@store_blueprint.route("cart/submit", methods=["POST"])
def submit_cart():
    cart_items = get_list_of_cart_items()
    if cart_items:
        return redirect(url_for("store.checkout"))
    else:
        flash("Add items to cart to checkout.", "danger")
        return redirect(url_for("store.cart"))


@store_blueprint.route("checkout", methods=["GET", "POST"])
def checkout():
    form = CheckoutForm()
    if form.validate_on_submit():
        process_order()
        flash("Order has been processsed.", "success")
        return redirect(url_for("store.checkout_success"))
    return render_template("store/checkout.html", title="Checkout", form=form)


@store_blueprint.route("checkout/success")
def checkout_success():
    if request.referrer:
        return render_template("store/checkout_success.html", title="Checkout")
    else:
        abort(400)
