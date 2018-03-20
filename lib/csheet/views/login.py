# -*- coding=UTF-8 -*-
"""Login manage.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import request, session, redirect, url_for

from .app import APP


@APP.route('/login')
def login():
    pass


@APP.route('/logout')
def logout():
    pass
