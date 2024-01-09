from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import SubmitField
from wtforms.validators import DataRequired


class CredentialForm(FlaskForm):
    credential = FileField(
        "Upload your Calendar Credentials",
        validators=[DataRequired(), FileAllowed(["json"])],
    )
    submit = SubmitField("Submit")
