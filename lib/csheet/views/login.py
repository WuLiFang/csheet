# -*- coding=UTF-8 -*-
"""Login manage.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from functools import wraps

import cgtwq
import six
from flask import make_response, redirect, request, session

from ..__about__ import __version__
from ..core import APP


def auth_login():
    """Login with auth data.  """

    auth = request.authorization
    if not auth:
        return False
    account_info = cgtwq.login(auth.username,
                               auth.password)

    for k, v in list(account_info._asdict().items()):
        session[k] = v
    return True


def authenticate(message=None):
    """Sends a 401 response that enables basic auth"""

    resp = make_response(message or 'Login required', 401)
    resp.headers['WWW-Authenticate'] = 'Basic realm="CGTeamWork"'
    return resp


def validate_auth():
    """Validate auth.  """

    return session.get('token') or auth_login()


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
        if APP.config['IS_LOCAL_MODE']:
            return func(*args, **kwargs)

        msg = '请使用和CGTeamWork相同的帐号和密码登录'
        try:
            if validate_auth():
                return func(*args, **kwargs)
        except cgtwq.LoginError:
            session['token'] = None
            msg = '登录过期'
        except cgtwq.CGTeamWorkException as ex:
            msg = six.text_type(ex)
        return authenticate(msg)
    return _func
