# -*- coding=UTF-8 -*-
"""View utility.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from functools import wraps

from flask import redirect, session, request, url_for

from wlf import cgtwq


def require_login(func):
    """Decorator, require login before return view.   """

    @wraps(func)
    def _func(*args, **kwargs):
        try:
            if'token' in session:
                return func(*args, **kwargs)
        except cgtwq.LoginError:
            pass

        return redirect(url_for('login', **{'from': request.full_path}))

    return _func


def format_error(ex):
    """Return formated error message."""

    assert isinstance(ex, Exception)
    return {'token::login, get account data error': '获取用户数据失败',
            'token::login, 密码错误,请检查': '密码错误,请检查'
            }.get(ex.message, ex.message)
