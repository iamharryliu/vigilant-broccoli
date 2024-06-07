import sys
from App import create_app, db
from App.config import DIT_CONFIG, SIT_CONFIG, TEST_CONFIG
import utils
import dev.mock.utils as mock_utils

COMMANDS = {
    "RUNSERVER": "runserver",
    "CREATE_ADMIN": "create_admin",
    "SETUP_DB": "setup_db",
    "SETUP_MOCK": "setup_mock",
    "CLEANUP": "cleanup",
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

    def setup_db(self):
        utils.setup_db(db)


def main():
    env = sys.argv[1]
    command = sys.argv[2]
    devManager = DevManager(env)
    if command == COMMANDS["RUNSERVER"]:
        devManager.runserver()
    elif command == COMMANDS["CREATE_ADMIN"]:
        utils.create_admin(db)
    elif command == COMMANDS["SETUP_DB"]:
        utils.setup_db(db)
    elif command == COMMANDS["SETUP_MOCK"]:
        mock_utils.reset_mock(db)
    elif command == COMMANDS["CLEANUP"]:
        utils.cleanup(db)
    else:
        print(f"Unknown command '{command}' has been entered.")


if __name__ == "__main__":
    main()
