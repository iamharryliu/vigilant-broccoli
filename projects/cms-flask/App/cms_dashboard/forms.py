from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed
from wtforms import (
    StringField,
    TextAreaField,
    SubmitField,
    PasswordField,
    EmailField,
    MultipleFileField,
)
from wtforms.validators import DataRequired, Email, EqualTo


class CreateUserForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    email = EmailField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    confirm_password = PasswordField(
        "Confirm Password", validators=[DataRequired(), EqualTo("password")]
    )
    submit = SubmitField("Create User")


class CreateGroupForm(FlaskForm):
    name = StringField("User Group Name", validators=[DataRequired()])
    application = StringField("Application", validators=[DataRequired()])
    submit = SubmitField("Create User Group")


class CreateAppForm(FlaskForm):
    name = StringField("App Name", validators=[DataRequired()])
    submit = SubmitField("Create App")


class UpdateAppForm(FlaskForm):
    name = StringField("App Name", validators=[DataRequired()])
    submit = SubmitField("Update App Name")


class UpdateUserForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    email = EmailField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    confirm_password = PasswordField(
        "Confirm Password", validators=[DataRequired(), EqualTo("password")]
    )
    submit = SubmitField("Update User")


class ContactForm(FlaskForm):
    name = StringField("Name", validators=[DataRequired()])
    email = StringField("Email", validators=[DataRequired(), Email()])
    phone = StringField("Phone", validators=[DataRequired()])
    subject = StringField("Subject", validators=[DataRequired()])
    message = TextAreaField("Message", validators=[DataRequired()])
    submit = SubmitField("Send")


class ContentForm(FlaskForm):
    content = TextAreaField("Content", validators=[DataRequired()])
    submit = SubmitField("Send")


class UploadForm(FlaskForm):
    directory_name = StringField("Album Name", validators=[DataRequired()])
    images = MultipleFileField(
        "Images", validators=[DataRequired(), FileAllowed(["jpg", "jpeg", "png"])]
    )
    submit = SubmitField("Upload")
