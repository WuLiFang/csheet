# -*- coding=UTF-8 -*-
"""RESTful api.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from os.path import getmtime

from flask import jsonify, request, session
from six import text_type

from wlf.path import get_unicode as u

from ..database import get_database, get_images, get_project_code
from ..image import HTMLImage
from .app import APP
from .util import require_login

from ..cache import CACHE


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


@APP.route('/api/image/url')
def image_url():
    """get realtime url for all role.   """

    uuid = request.args['uuid']
    return jsonify(_image_url(uuid))


@CACHE.memoize('view', expire=10)
def _image_url(uuid):
    image = HTMLImage.from_uuid(uuid)
    return {i: image.get(i, is_client=True) for i in image.generate_methods}


@APP.route('/api/project_code/<project>')
@APP.route('/project_code/<project>')  # TODO: remove usage in js
def project_code(project):
    return _apply_token(get_project_code, project)
