from App import db
from App.config import FILTER_CONFIG


class Filter_tag(db.Model):
    tag_name = db.Column(db.String, db.ForeignKey("tag.name"), primary_key=True)
    filter_id = db.Column(db.Integer, db.ForeignKey("filter.id"), primary_key=True)


class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    outfits = db.relationship(
        "Outfit", secondary="outfit_tag", backref="tags", lazy=True
    )
    filters = db.relationship(
        "Filter", secondary="filter_tag", backref="tags", lazy=True
    )

    def __repr__(self):
        return self.name

    def as_json(self):
        return {
            "name": self.name,
            "number_of_outfits": len(self.outfits),
            "number_of_filters": len(self.filters),
        }


class Filter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    is_default = db.Column(db.Boolean)
    sort_by = db.Column(db.String, default=FILTER_CONFIG.DEFAULT_SORT_BY)
    gender = db.Column(db.String, default="")
    season = db.Column(db.String, default="")
    use_location = db.Column(db.Boolean, default=True)
    min_temperature = db.Column(db.Float)
    max_temperature = db.Column(db.Float)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    def as_json(self):
        return {
            "id": self.id,
            "is_default": self.is_default,
            "sortBy": self.sort_by,
            "gender": [gender for gender in self.gender.split(",") if gender],
            "season": [season for season in self.season.split(",") if season],
            "tags": [tag.name for tag in self.tags],
            "useLocation": self.use_location,
            "minTemperature": self.min_temperature,
            "maxTemperature": self.max_temperature,
        }
