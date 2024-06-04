from App import db
from App.models import Tag


def create_tags(tags):
    for tag in tags:
        if not Tag.query.filter_by(name=tag).scalar():
            new_tag = Tag(name=tag)
            db.session.add(new_tag)
