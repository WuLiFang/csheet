# -*- coding=UTF-8 -*-
"""Test utilities.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os
from unittest import skipIf

import flask

import csheet
from cgtwq import DesktopClient

skip_if_not_logged_in = skipIf(not DesktopClient.is_logged_in(),  # pylint: disable=invalid-name
                               'CGTeamWork is not logged in.')

ROOT = os.path.abspath(os.path.dirname(__file__))


def setup():
    """Setup test env.  """

    csheet.core.APP.config.from_object('settings')
    csheet.core.init()


def path(*other):
    """Get resource path.

    Returns:
        six.text_type: Joined absolute path.
    """

    return os.path.abspath(os.path.join(ROOT, *other))


@csheet.core.APP.route('/_login', methods=('POST',))
def _login():
    """For test client login.  """

    flask.session['token'] = DesktopClient.token()
    flask.session['name'] = 'Test user'
    return 'Logged in'
