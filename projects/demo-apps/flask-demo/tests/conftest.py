import pytest
from App.config import TEST_CONFIG
from App.const import ENVIRONMENT_TYPE
from App import create_app, db
from dev_manager import DevManager


@pytest.fixture()
def app():
    app = create_app(config=TEST_CONFIG)
    devManager = DevManager(ENVIRONMENT_TYPE.TEST)
    devManager.setup_db(db)
    yield app


@pytest.fixture()
def client(app):
    yield app.test_client()


@pytest.fixture()
def runner(app):
    yield app.test_cli_runner()
