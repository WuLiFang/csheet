# -*- coding=UTF-8 -*-
"""Provide image information.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
from os.path import basename, getmtime, join

import pendulum
from flask import abort, make_response, render_template, request, send_file
from gevent import sleep, spawn
from gevent.queue import Empty, Queue
from six import text_type

from wlf import cgtwq
from wlf.path import Path

from ..database import get_image
from ..exceptions import u_abort
from .app import APP

LOGGER = logging.getLogger(__name__)


@APP.route('/images/<uuid>.<role>')
def response_image(uuid, role):
    """Response file for a image.

    Decorators:
        APP

    Args:
        uuid (str): Image uuid.
        role (str): Role of wanted file.

    Returns:
        flask.Response: Response for client.
    """

    image = get_image(uuid)
    kwargs = {}
    folder = APP.config.get('storage')
    if folder:
        kwargs['output'] = join(folder, role, uuid)

    result = Queue(1)

    def _gen():
        try:
            ret = image.generate(role,
                                 is_strict=role not in ('thumb', 'full'),
                                 limit_size=APP.config['preview_limit_size'],
                                 **kwargs)
            result.put(ret)
        except ValueError as ex:
            LOGGER.debug('Can not generate: %s', ex)
        except KeyError as ex:
            LOGGER.debug('No source: %s', ex)
        except Exception as ex:  # pylint: disable=broad-except
            result.put(ex)
    spawn(_gen)
    sleep()

    try:
        generated = result.get(block=False)
        if isinstance(generated, Exception):
            LOGGER.error(
                'Unexpected error durring generation: %s: %s',
                image,
                repr(generated))
            u_abort(500, generated)

        if not Path(generated).exists():
            try:
                del image.generated[role]
            except KeyError:
                pass
            return make_response('Generated file has been moved', 503, {'Retry-After': 10})

        resp = send_file(text_type(generated), conditional=True)
        resp.cache_control.max_age = 0
        resp.cache_control.no_cache = True
        if request.args:
            resp.cache_control.no_store = True
        return resp
    except Empty:
        LOGGER.debug('Image not ready: %s', image)
        return make_response('Image not ready.', 503, {'Retry-After': 10})


@APP.route('/images/<uuid>.info')
def image_info(uuid):
    """Get image related information.   """

    image = get_image(uuid)

    try:
        select = image.cgteamwork_select
    except AttributeError:
        abort(404, 'No related task found.')

    assert isinstance(select, cgtwq.database.Selection)
    data = select.get_fields(
        'pipeline', 'artist', 'leader_status', 'director_status', 'client_status', 'note_num')
    data.sort(key=lambda i: (
        i[0] == '合成',
        i[0] == '渲染',
        i[0] == '灯光',
        i[0] == '特效',
        i[0] == '解算',
        i[0] == '动画',
        i[0] == 'Layout',
    ))

    metadata = {}
    for v in image.source.values():
        if v in metadata:
            # Skip same file to reduce io.
            continue
        try:
            _mtime = getmtime(text_type(v))
        except OSError:
            _mtime = None
        _data = (basename(text_type(v)), _mtime)
        metadata[v] = _data

    metadata = sorted(metadata.values(), key=lambda x: x[1])

    metadata = [(i[0],
                 pendulum.from_timestamp(i[1]).diff_for_humans(locale='zh')
                 if i[1] else '<获取失败>')
                for i in metadata]
    return render_template('image_info.html', data=data, metadata=metadata)


@APP.route('/images/<uuid>.notes/<pipeline>')
def image_notes(uuid, pipeline):
    image = get_image(uuid)
    select = image.cgteamwork_select
    assert isinstance(select, cgtwq.database.Selection)
    select = select.filter(cgtwq.Field('pipeline') == pipeline)
    notes = select.get_notes()
    return render_template('image_notes.html', notes=notes, server_ip=cgtwq.CGTeamWorkClient.server_ip())
