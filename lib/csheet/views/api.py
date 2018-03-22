# -*- coding=UTF-8 -*-
"""RESTful api.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import jsonify, session

from wlf.path import get_unicode as u

from ..database import get_database, get_images, get_project_code
from .app import APP
from .util import require_login


@APP.route('/api/list_images/<project>/<pipeline>/<prefix>')
@require_login
def list_images(project, pipeline, prefix):
    """List images.   """

    ret = _apply_token(get_images, database(project), pipeline, prefix)
    ret = [u(i.path) for i in ret]
    return jsonify(ret)


def _apply_token(func, *args, **kwargs):
    token = session['token']
    return func(*args, token=token, **kwargs)


@APP.route('/api/database/<project>')
@require_login
def database(project):
    """get database for project.   """

    return _apply_token(get_database, project)


@APP.route('/api/project_code/<project>')
@APP.route('/project_code/<project>')  # TODO: remove usage in js
def project_code(project):
    return _apply_token(get_project_code, project)
