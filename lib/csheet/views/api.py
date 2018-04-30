# -*- coding=UTF-8 -*-
"""RESTful api.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import session


from ..database import get_project_info
from .app import APP
from .util import require_login


def _apply_token(func, *args, **kwargs):
    token = session['token']
    return func(*args, token=token, **kwargs)


@APP.route('/api/database/<project>')
@require_login
def database(project):
    """get database for project.   """
    return _apply_token(get_project_info, project).database


@APP.route('/api/project_code/<project>')
def project_code(project):
    """Get project code from project name.  """

    return _apply_token(get_project_info, project).code
