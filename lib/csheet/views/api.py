# -*- coding=UTF-8 -*-
"""RESTful api.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import jsonify, request, session

from wlf import cgtwq
from wlf.path import get_unicode as u

from ..cache import CACHE
from ..database import get_database, get_image, get_images, get_project_code
from ..image import HTMLImage
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


@APP.route('/api/image/url')
def image_url():
    """get realtime url for all role.   """

    uuid = request.args['uuid']
    return jsonify(_image_url(uuid))


@CACHE.memoize('view', expire=10)
def _image_url(uuid):
    image = get_image(uuid)
    return {i: image.get(i, is_client=True) for i in image.generate_methods}


@APP.route('/api/project_code/<project>')
@APP.route('/project_code/<project>')  # TODO: remove usage in js
def project_code(project):
    return _apply_token(get_project_code, project)


@APP.route('/api/image/note', methods=('GET', 'POST'))
def note():
    uuid = request.args['uuid']
    pipeline = request.args['pipeline']

    image = get_image(uuid)
    select = image.cgteamwork_select
    assert isinstance(select, cgtwq.database.Selection)
    select.token = session['token']
    select = select.filter(cgtwq.Field('pipeline') == pipeline)
    notes = select.get_notes()
    return jsonify(notes)
