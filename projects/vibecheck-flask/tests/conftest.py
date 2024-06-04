import pytest
from App.config import TEST_CONFIG
from App import create_app, db
import utils


@pytest.fixture()
def app():
    app = create_app(config=TEST_CONFIG)
    utils.setup_db(db)
    yield app


@pytest.fixture()
def client(app):
    yield app.test_client()


@pytest.fixture()
def runner(app):
    yield app.test_cli_runner()
