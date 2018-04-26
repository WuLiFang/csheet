# -*- coding=UTF-8 -*-
"""Provide image information.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import errno
import logging
from contextlib import closing

import pendulum
from flask import render_template, send_file, session

import cgtwq

from ..filename import filter_filename
from ..model import Session
from ..video import HTMLVideo
from .app import APP

LOGGER = logging.getLogger(__name__)


@APP.route('/videos/<uuid>.<role>')
def response_video(uuid, role):
    """Response file for a image.

    Decorators:
        APP

    Args:
        uuid (str): Image uuid.
        role (str): Role of wanted file.

    Returns:
        flask.Response: Response for client.
    """

    accept_role = ('thumb', 'preview', 'full')
    if role not in accept_role:
        return 'Role must in {}'.format(accept_role), 400
    try:
        video = HTMLVideo(uuid=uuid)
    except ValueError:
        return 'No such video', 404

    role = {'full': 'poster'}.get(role, role)
    LOGGER.debug(video)
    ret = getattr(video, role)
    try:
        if ret:
            LOGGER.debug(ret)
            return send_file(filter_filename(ret), conditional=True)
    except IOError as ex:
        if ex.errno == errno.ENOENT:
            if role in ('thumb', 'preview'):
                setattr(video, role, None)
                sess = Session()
                with closing(sess):
                    sess.add(video)
                    sess.commit()
        else:
            raise

    return 'No such file', 400


@APP.route('/videos/<uuid>.info')
def video_info(uuid):
    """Get image related information.   """

    try:
        video = HTMLVideo(uuid=uuid)
    except ValueError:
        return 'No such video', 404

    database = video.database
    module = cgtwq.Database(database)['shot_task']
    ids = video.task_info['task_id']

    select = module.select(*ids)
    assert isinstance(select, cgtwq.Selection)
    select.token = session['token']

    data = select.get_fields(
        'pipeline', 'artist', 'leader_status', 'director_status', 'client_status', 'note_num', 'id')
    data.sort(key=lambda i: (
        i[0] == '输出',
        i[0] == '合成',
        i[0] == '渲染',
        i[0] == '灯光',
        i[0] == '特效',
        i[0] == '解算',
        i[0] == '动画',
        i[0] == 'Layout',
        i[0]
    ))

    def _format(i):
        if i[0] is None:
            return ('<{}文件不存在>'.format(i[2]), '')
        return i[0].name, (pendulum.from_timestamp(i[1]).diff_for_humans(locale='zh')
                           if i[1] else '<获取失败>')

    metadata = [(video.src, video.src_mtime, '视频'),
                (video.poster, video.poster_mtime, '单帧')]

    metadata = [_format(i) for i in metadata]

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
