import pytest
from App import create_app
from App.database import DatabaseManager


@pytest.fixture()
def app():
    app = create_app()
    yield app
    DatabaseManager.drop_db()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()
