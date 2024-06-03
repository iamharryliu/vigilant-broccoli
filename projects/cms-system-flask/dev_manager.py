import sys
from App import create_app, db, bcrypt
from App.models import User
from App.config import TEST_CONFIG, DIT_CONFIG, SIT_CONFIG
from utils.mock.json_placeholder import get_users
from getpass import getpass

COMMANDS = {
    "RUNSERVER": "runserver",
    "SETUP_DB": "setup_db",
    "SETUP_MOCK": "setup_mock",
    "CREATE_USER": "create_user",
}

ENVIRONMENTS = {"TEST", "SIT", "DIT"}


DEFAULT_PASSWORD = "password"


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


class DevManager:
    def __init__(self, env):
        if env == "TEST":
            app = create_app(config=TEST_CONFIG)
        if env == "DIT":
            app = create_app(config=DIT_CONFIG)
        if env == "SIT":
            app = create_app(config=SIT_CONFIG)
        ctx = app.app_context()
        ctx.push()
        self.app = app

    def runserver(self):
        self.app.run(debug=True)

    def setup_db(self, db):
        db.drop_all()
        db.create_all()

    def create_user(self, db):
        username = input("Enter username: ")
        password = getpass("Enter password: ")
        confirm_password = getpass("Confirm password: ")
        if password != confirm_password:
            if input("Try again(y/n): ") == "y":
                self.create_user(db)
            return
        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        user = User(username=username, password=hashed_password)
        db.session.add(user)
        db.session.commit()
        print("Admin user has successfully been created.")

    def setup_mock(self, db):
        app = create_app()
        ctx = app.app_context()
        ctx.push()
        db.drop_all()
        db.create_all()
        create_users()


def main():
    env = sys.argv[1]
    command = sys.argv[2]
    devManager = DevManager(env)
    if command == COMMANDS["RUNSERVER"]:
        devManager.runserver()
    elif command == COMMANDS["SETUP_DB"]:
        devManager.setup_db(db)
    elif command == COMMANDS["SETUP_MOCK"]:
        devManager.setup_mock(db)
    elif command == COMMANDS["CREATE_USER"]:
        devManager.create_user(db)
    else:
        print(f"Unknown command '{command}' has been entered.")


if __name__ == "__main__":
    main()
