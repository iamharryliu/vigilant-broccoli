from flask import request
from flask_login import login_required
from flask_cors import cross_origin
from App import db
from App.constants import BLUEPRINTS, HTTP_METHODS, IMAGE_ENDPOINTS
from App.image.utils import save_picture_base64
from App.models import Image
from App.config import APP_CONFIG

images_blueprint = BLUEPRINTS.IMAGES_BLUEPRINT


@images_blueprint.route(IMAGE_ENDPOINTS.UPLOAD_BASE_64, methods=[HTTP_METHODS.POST])
@login_required
@cross_origin(supports_credentials=True)
def upload_images_base64():
    data = request.get_json()
    picture = data["picture"]
    filenames = [
        save_picture_base64(
            picture, location="uploads", image_size=APP_CONFIG.IMAGE_OUTPUT_SIZE
        )
    ]
    for filename in filenames:
        image = Image(image_file=filename)
        db.session.add(image)
    db.session.commit()
    return {"filenames": filenames}
