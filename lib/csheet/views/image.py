# -*- coding=UTF-8 -*-
"""Provide image information.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
from os.path import basename, join

import pendulum
from flask import (abort, make_response, render_template, request, send_file)
from gevent import sleep, spawn
from gevent.queue import Empty, Queue
from six import text_type

import cgtwq
from wlf.path import Path

from ..cache import CACHE, getmtime
from ..database import get_image
from ..exceptions import u_abort
from .app import APP

LOGGER = logging.getLogger(__name__)


@CACHE.memoize(name='images', expire=10)
def _get_gen_image(uuid, role):
    image = get_image(uuid)
    kwargs = {}
    folder = APP.config.get('storage')
    if folder:
        kwargs['output'] = join(folder, role, uuid)
    ret = image.generate(role,
                         is_strict=role not in ('thumb', 'full'),
                         limit_size=APP.config['preview_limit_size'],
                         **kwargs)
    return ret


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

    result = Queue(1)
    image = get_image(uuid)

    def _gen():
        try:
            ret = _get_gen_image(uuid, role)
            result.put(ret)
        except ValueError as ex:
            LOGGER.debug('Can not generate: %s', ex)
        except KeyError as ex:
            LOGGER.debug('No source: %s', ex)
        except Exception as ex:  # pylint: disable=broad-except
            LOGGER.error(
                'Unexpected error durring generation: %s',
                image, exc_info=True)
            result.put(ex)
    spawn(_gen)
    sleep()

    try:
        generated = result.get(block=False)
        if isinstance(generated, Exception):
            u_abort(500, generated)

        if not Path(generated).exists():
            try:
                del image.generated[role]
            except KeyError:
                pass
            return make_response('Generated file has been moved', 503, {'Retry-After': 10})

        resp = send_file(text_type(generated), conditional=True)
        return resp
    except Empty:
        timestamp = None
        try:
            timestamp = int(request.args.get('timestamp'))
        except (TypeError, ValueError):
            pass

        if timestamp:
            generated = image.generated.get(role)
            try:
                if (timestamp and generated
                        and abs(getmtime(text_type(generated)) - timestamp) < 1e-6):
                    return send_file(text_type(generated), conditional=True)
            except OSError:
                pass

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

    assert isinstance(select, cgtwq.Selection)
    data = select.get_fields(
        'pipeline', 'artist', 'leader_status', 'director_status', 'client_status', 'note_num', 'id')
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
            LOGGER.error('Get mtime fail: %s', text_type(v), exc_info=True)
            _mtime = None
        _data = (basename(text_type(v)), _mtime)
        metadata[v] = _data

    metadata = sorted(metadata.values(), key=lambda x: x[1])

    metadata = [(i[0],
                 pendulum.from_timestamp(i[1]).diff_for_humans(locale='zh')
                 if i[1] else '<获取失败>')
                for i in metadata]
    note_url_template = ((
        'http://{server_ip}/index.php?'
        'controller=v_note'
        '&method=show_page'
        '&db={database}'
        '&module={module}'
        '&task_id=${{taskId}}').format(
            server_ip=cgtwq.server.setting.SERVER_IP,
            database=select.module.database.name,
            module=select.module.name))
    return render_template('image_info.html',
                           data=data,
                           metadata=metadata,
                           note_url_template=note_url_template)
