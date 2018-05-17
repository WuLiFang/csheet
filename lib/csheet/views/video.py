# -*- coding=UTF-8 -*-
"""Provide image information.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import errno
import logging
from collections import namedtuple

import pendulum
from flask import render_template, send_file, session

import cgtwq

from ..filename import filter_filename
from ..video import HTMLVideo
from .app import APP
from .core import database_session

LOGGER = logging.getLogger(__name__)

VIDEO_ROLES = ('thumb', 'preview', 'poster')


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

    if role not in VIDEO_ROLES:
        return 'Role must in {}'.format(VIDEO_ROLES), 400

    with database_session() as sess:
        video = sess.query(HTMLVideo).get(uuid)
        if not video:
            return 'No such video', 404
        return _try_send_file(video, role, sess)


def _try_send_file(video, role, sess):
    path = getattr(video, role)
    try:
        return send_file(filter_filename(path), conditional=True)
    except IOError as ex:
        if ex.errno == errno.ENOENT:
            _handle_not_eixsits(video, role, sess)
        else:
            raise
    return 'No such file', 400


def _handle_not_eixsits(video, role, sess):
    if role in ('thumb', 'preview'):
        setattr(video, role, None)
        sess.commit()


class VideoInfo(namedtuple(
        'VideoInfo',
        ('pipeline', 'artist', 'leader_status',
         'director_status', 'client_status', 'note_num', 'id'))):
    """Video information.  """

    def sort_key(self):
        """Key for list sort . """

        pipeline = self.pipeline
        return (
            pipeline == '输出',
            pipeline == '合成',
            pipeline == '渲染',
            pipeline == '灯光',
            pipeline == '特效',
            pipeline == '解算',
            pipeline == '动画',
            pipeline == 'Layout',
            pipeline
        )


@APP.route('/videos/<uuid>.info')
def video_info(uuid):
    """Get image related information.   """

    with database_session() as sess:
        video = sess.query(HTMLVideo).get(uuid)
        if not video:
            return 'No such video', 404

    database = video.database
    module = cgtwq.Database(database)['shot_task']
    if video.task_info is None:
        return ''
    ids = video.task_info['task_id']

    select = module.select(*ids)
    assert isinstance(select, cgtwq.Selection)
    select.token = session['token']

    try:
        data = select.get_fields(*VideoInfo._fields)
    except cgtwq.LoginError:
        return '登录过期, 请刷新页面重新登录'

    data = [VideoInfo(*i) for i in data]
    data.sort(key=lambda i: i.sort_key())

    metadata = [(video.src, video.src_mtime, '视频'),
                (video.poster, video.poster_mtime, '单帧')]

    metadata = [_format_metadata(i) for i in metadata]

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


def _format_metadata(i):
    if i[0] is None:
        return ('<{}文件不存在>'.format(i[2]), '')
    return i[0].name, (pendulum.from_timestamp(i[1]).diff_for_humans(locale='zh')
                       if i[1] else '<获取失败>')
