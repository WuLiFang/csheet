# -*- coding=UTF-8 -*-
"""Test utilities.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os
from unittest import skipIf

import flask

from cgtwq import DesktopClient
from csheet import generation, model, setting, APP

skip_if_not_logged_in = skipIf(not DesktopClient.is_logged_in(),  # pylint: disable=invalid-name
                               'CGTeamWork is not logged in.')

ROOT = os.path.abspath(os.path.dirname(__file__))


def setup():
    """Setup test env.  """

    storage = path('storage')
    model.bind('sqlite:///{}\\csheet.db'.format(storage))
    setting.STORAGE = storage


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
    return 'Logged in'
