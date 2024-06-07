import sys
from App import create_app, db
from App.config import TEST_CONFIG, DIT_CONFIG, SIT_CONFIG

COMMANDS = {
    "RUNSERVER": "runserver",
    "SETUP_DB": "setup_db",
}

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
        app = create_app()
        ctx = app.app_context()
        ctx.push()
        db.drop_all()
        db.create_all()


def main():
    env = sys.argv[1]
    command = sys.argv[2]
    devManager = DevManager(env)
    if command == COMMANDS["RUNSERVER"]:
        devManager.runserver()
    elif command == COMMANDS["SETUP_DB"]:
        devManager.setup_db(db)
    else:
        print(f"Unknown command '{command}' has been entered.")


if __name__ == "__main__":
    main()
