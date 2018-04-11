# -*- coding=UTF-8 -*-
"""View utility.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from functools import wraps

from flask import redirect, session, request, url_for

import cgtwq


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
