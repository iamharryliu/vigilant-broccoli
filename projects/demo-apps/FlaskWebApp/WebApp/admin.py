from flask_login import current_user
from flask_admin import AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from WebApp.config import Config


class MyAdminIndexView(AdminIndexView):
    @expose("/")
    def index(self):
        return self.render("admin/index.html")

    def is_accessible(self):
        return current_user.username in Config.ADMINS
