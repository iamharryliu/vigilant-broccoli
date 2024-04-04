from flask_wtf import FlaskForm
from wtforms import (
    StringField,
    SelectField,
    DateField,
    RadioField,
    BooleanField,
    SubmitField,
)
from wtforms.validators import DataRequired, Email

default_option = [(None, "Select")]

size_choices = [
    (None, "Select Size"),
    ("X-Small", "X-Small"),
    ("Small", "Small"),
    ("Medium", "Medium"),
    ("Large", "Large"),
    ("X-Large", "X-Large"),
]

quantity_choices = default_option + [(str(n), n) for n in range(1, 11)]


class ItemForm(FlaskForm):
    quantity = SelectField(
        "Quantity", choices=quantity_choices, validators=[DataRequired()]
    )
    size = SelectField("Size", choices=size_choices, validators=[DataRequired()])
    submit = SubmitField("Submit")


provinces = [
    ("--", "--"),
    ("Alberta", "AB"),
    ("British Columbia", "BC"),
    ("Manitoba", "MB"),
    ("New Brunswich", "NB"),
    ("Newfoundland and Labrador", "NL"),
    ("Northwest Territories", "NT"),
    ("Nova Scotia", "NS"),
    ("Nunavat", "NU"),
    ("Ontario", "ON"),
    ("Prince Edward Island", "PEI"),
    ("Quebec", "QC"),
    ("Saskatchewan", "SK"),
    ("Yukon", "YT"),
]

countries = [("--", "--"), ("Canada", "CA")]


class CheckoutForm(FlaskForm):
    email = StringField("Email", validators=[DataRequired(), Email()])
    newsletter_sub = BooleanField(
        "Keep me up to date on news and exclusive offers", default=True
    )
    shipping_first_name = StringField("First Name", validators=[DataRequired()])
    shipping_last_name = StringField("Last Name", validators=[DataRequired()])
    shipping_address = StringField("Address", validators=[DataRequired()])
    shipping_address_unit = StringField("Apartment")
    shipping_city = StringField("City", validators=[DataRequired()])
    shipping_region = SelectField(
        "State/Province/Region",
        choices=provinces,
        default="--",
        validators=[DataRequired()],
    )
    shipping_postal_code = StringField("Postal Code", validators=[DataRequired()])
    shipping_country = SelectField(
        "Country", choices=countries, default="--", validators=[DataRequired()]
    )
    shipping_phone_number = StringField("Phone Number", validators=[DataRequired()])

    shipping_method = RadioField(
        "Shipping Method",
        choices=[
            ("Standard", "Standard ( 7 - 14 Business Days )"),
            ("Express", "Express ( 1 - 7 Business Days"),
        ],
        validators=[DataRequired()],
        default="Standard",
    )

    card_number = StringField("Card Number", validators=[DataRequired()])
    card_name = StringField("Name on Card", validators=[DataRequired()])
    card_expiration_month = StringField("Exp. Month", validators=[DataRequired()])
    card_expiration_year = StringField("Exp. Year", validators=[DataRequired()])

    same_as_shipping = BooleanField("Same as shipping addess")

    billing_first_name = StringField("First Name", validators=[DataRequired()])
    billing_last_name = StringField("Last Name", validators=[DataRequired()])
    billing_address = StringField("Address", validators=[DataRequired()])
    billing_address_unit = StringField("Apartment")
    billing_city = StringField("City", validators=[DataRequired()])
    billing_region = SelectField(
        "State/Province/Region", choices=provinces, default="--"
    )
    billing_postal_code = StringField("Postal Code", validators=[DataRequired()])
    billing_country = SelectField("Country", choices=countries, default="--")
    billing_phone_number = StringField("Phone Number", validators=[DataRequired()])

    submit = SubmitField("Submit")
