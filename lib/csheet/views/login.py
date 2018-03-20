# -*- coding=UTF-8 -*-
"""Login manage.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)


from flask import redirect, request, session, render_template, flash

from wlf import cgtwq

from .app import APP
from . import util


@APP.route('/login', methods=['GET', 'POST'])
def login():
    """Login on teamwork.   """

    if request.method == 'POST':
        try:
            account_info = cgtwq.login(request.form['account'],
                                       request.form['password'])
        except ValueError as ex:
            flash(util.format_error(ex))
            return redirect(request.full_path)
        for k, v in account_info._asdict().items():
            session[k] = v
        print(request.args.get('from', '/'))
        return redirect(request.args.get('from', '/'))
    return render_template('login.html')


@APP.route('/logout', methods=['GET', 'POST'])
def logout():
    """Clear login information.   """

    session.clear()
    if request.method == 'GET':
        return redirect('/')
