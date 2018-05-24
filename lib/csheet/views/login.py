# -*- coding=UTF-8 -*-
"""Login manage.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from functools import wraps

from flask import flash, redirect, render_template, request, session, url_for
from six import text_type

import cgtwq

from ..__about__ import __version__
from .app import APP


@APP.route('/login', methods=['GET', 'POST'])
def login():
    """Login on teamwork.   """

    if request.method == 'POST':
        try:
            account_info = cgtwq.login(request.form['account'],
                                       request.form['password'])
        except cgtwq.CGTeamWorkException as ex:
            flash(text_type(ex))
            return redirect(request.full_path)
        for k, v in account_info._asdict().items():
            session[k] = v
        print(request.args.get('from', '/'))
        return redirect(request.args.get('from', '/'))
    return render_template('login.html', __version__=__version__)


@APP.route('/logout', methods=['GET', 'POST'])
def logout():
    """Clear login information.   """

    session.clear()
    if request.method == 'GET':
        return redirect('/')
    return 'Logged out'


def require_login(func):
    """Decorator, require login before return view.   """

    @wraps(func)
    def _func(*args, **kwargs):
        try:
            if session.get('token'):
                return func(*args, **kwargs)
        except cgtwq.LoginError:
            pass

        return redirect(url_for('login', **{'from': request.full_path}))

    return _func
