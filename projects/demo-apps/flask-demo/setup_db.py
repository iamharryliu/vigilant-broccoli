from WebApp import create_app, db, bcrypt
from WebApp.models import User
from json_placeholder import get_users

DEFAULT_PASSWORD = "password"


def main():
    app = create_app()
    ctx = app.app_context()
    ctx.push()
    db.drop_all()
    db.create_all()
    create_users()


def create_users():
    users = get_users()
    for user in users:
        hashed_password = bcrypt.generate_password_hash(DEFAULT_PASSWORD).decode(
            "utf-8"
        )
        user = User(
            username=user["username"], email=user["email"], password=hashed_password
        )
        db.session.add(user)
    db.session.commit()


if __name__ == "__main__":
    main()
