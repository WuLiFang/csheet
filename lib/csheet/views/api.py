# -*- coding=UTF-8 -*-
"""RESTful api.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from contextlib import closing

from flask import jsonify, request, session

import cgtwq
from wlf.path import get_unicode as u

from ..cache import CACHE
from ..database import get_database, get_image, get_images, get_project_code
from ..model import Session, Video
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


@APP.route('/api/image/timestamp')
def image_timestamp():
    """get realtime source timestamp for all role.   """

    uuid = request.args['uuid']
    return jsonify(_image_timestamp(uuid))


@APP.route('/api/video/mtime')
def video_mtime():
    """get realtime source timestamp for all role.   """

    return 'Deprecated', 410

    uuid = request.args['uuid']
    try:
        video = Video(uuid=uuid)
    except ValueError:
        return 'No such video', 404

    sess = Session()
    with closing(sess):
        sess.add(video)
        if not video.is_need_update:
            video.is_need_update = True
            sess.commit()
        return jsonify({'thumb': video.thumb_mtime,
                        'preview': video.preview_mtime,
                        'full': video.poster_mtime})


@CACHE.memoize('view', expire=10)
def _image_timestamp(uuid):
    image = get_image(uuid)
    ret = {}
    for i in image.source:
        try:
            ret[i] = image.get_timestamp(i)
        except OSError:
            continue
    return ret


@APP.route('/api/project_code/<project>')
def project_code(project):
    """Get project code from project name.  """

    return _apply_token(get_project_code, project)


# @APP.route('/api/image/note', methods=('GET', 'POST'))
# def note():
#     uuid = request.args['uuid']
#     pipeline = request.args['pipeline']
#     image = get_image(uuid)
#     select = image.cgteamwork_select
#     assert isinstance(select, cgtwq.Selection)
#     select.token = session['token']
#     entry = select.filter(cgtwq.Field('pipeline') == pipeline).to_entry()
#     assert isinstance(entry, cgtwq.Entry)
#     notes = entry.get_notes()
#     if request.method == 'GET':
#         return jsonify(notes)
#     elif request.method == 'POST':
#         entry.module


@APP.route('/api/image/field', methods=('GET', 'PUT'))
@require_login
def database_field():
    """Get/Set database field.   """

    uuid = request.args['uuid']
    pipeline = request.args['pipeline']
    field = request.args['field']
    image = get_image(uuid)
    select = image.cgteamwork_select
    assert isinstance(select, cgtwq.Selection)
    entry = select.filter(cgtwq.Field('pipeline') == pipeline).to_entry()
    assert isinstance(entry, cgtwq.Entry)
    entry.token = session['token']
    if request.method == 'GET':
        return jsonify(entry[field])
    elif request.method == 'PUT':
        value = request.form['data']
        entry[field] = value
        return 'ok'
