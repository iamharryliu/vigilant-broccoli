import sys
from getpass import getpass
from flask import current_app
from App import create_app, db, bcrypt
from App.models import User, Application
from App.config import TEST_CONFIG, DIT_CONFIG, SIT_CONFIG, ENVIRONMENT_TYPE
from App.const import USER_TYPE


class COMMAND:
    RUNSERVER = "runserver"
    SETUP_DB = "setup_db"
    CREATE_USER = "create_user"
    CREATE_APP = "create_app"


ENVIRONMENTS = {"TEST", "SIT", "DIT"}


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

    def create_app(self, db):
        app_name: str = input("Enter app name: ")
        # app_name: str = 'app_name'
        app: Application = Application(name=app_name)
        db.session.add(app)
        db.session.commit()
        # user = self.create_user(db)
        # app.users.append(user)
        # db.session.commit()
        while input("Would you like to add users?(y/n): ") == "y":
            user = self.create_user(db)
            app.users.append(user)
            db.session.commit()
            print("User has successfully been created.")
        print("App has successfully been created.")

    def create_user(self, db) -> User:
        # username = 'username'
        # password = 'password'

        is_super_user = input("Super user? (y/n): ")
        username = input("Enter username: ")
        password = getpass("Enter password: ")
        if current_app.config["ENVIRONMENT"] is not ENVIRONMENT_TYPE.DIT:
            confirm_password = getpass("Confirm password: ")
            if password != confirm_password:
                if input("Try again(y/n): ") == "y":
                    self.create_user(db)
                return
        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        user = User(
            username=username,
            password=hashed_password,
            user_type=USER_TYPE.SYSTEM_ADMIN if is_super_user else USER_TYPE.USER,
        )
        db.session.add(user)
        db.session.commit()
        return user


def main():
    env = sys.argv[1]
    command = sys.argv[2]
    devManager = DevManager(env)
    if command == COMMAND.RUNSERVER:
        devManager.runserver()
    elif command == COMMAND.SETUP_DB:
        devManager.setup_db(db)
    elif command == COMMAND.CREATE_USER:
        devManager.create_user(db)
    elif command == COMMAND.CREATE_APP:
        devManager.create_app(db)
    else:
        print(f"Unknown command '{command}' has been entered.")


if __name__ == "__main__":
    main()
