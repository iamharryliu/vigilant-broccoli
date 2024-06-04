from App import db
from App.models import Tag


def parseForTags(text):
    tags = set(part[1:] for part in text.split() if part.startswith("#"))
    return tags


def create_tags(text="", tags=[]):
    if text:
        tags = parseForTags(text)
    for tag in tags:
        if not Tag.query.filter_by(name=tag).scalar():
            new_tag = Tag(name=tag)
            db.session.add(new_tag)
    return tags
