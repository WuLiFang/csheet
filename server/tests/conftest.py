"""Pytest conftest file.  """

import flask
import pytest
from tests import util

import cgtwq
from csheet import APP


@pytest.fixture(scope='session', autouse=True)
def setup():
    util.setup()


@pytest.fixture(name='client')
def _client():
    client: flask.testing.FlaskClient = APP.test_client()
    with client:
        if util.IS_CGTEAMWORK_LOGGED_IN:
            with client.session_transaction() as sess:
                sess['token'] = cgtwq.DesktopClient().token()
                sess['username'] = 'Test user'
        yield client
