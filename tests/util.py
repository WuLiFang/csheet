# -*- coding=UTF-8 -*-
"""Test utilities.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os
from unittest import skipIf

import flask

from cgtwq import DesktopClient
from csheet import APP, database, setting
from csheet.task import CELERY

skip_if_not_logged_in = skipIf(not DesktopClient.is_logged_in(),  # pylint: disable=invalid-name
                               'CGTeamWork is not logged in.')

ROOT = os.path.abspath(os.path.dirname(__file__))


def setup():
    """Setup test env.  """

    storage = path('storage')
    engine_uri = 'sqlite:///{}\\csheet.db'.format(storage)
    setting.STORAGE = storage
    setting.ENGI = engine_uri
    database.core.bind(engine_uri)
    CELERY.conf.task_always_eager = True


def path(*other):
    """Get resource path.

    Returns:
        six.text_type: Joined absolute path.
    """

    return os.path.abspath(os.path.join(ROOT, *other))


APP.testing = True


@APP.route('/_login', methods=('POST',))
def _login():
    """For test client login.  """

    flask.session['token'] = DesktopClient.token()
    flask.session['name'] = 'Test user'
    return 'Logged in'
