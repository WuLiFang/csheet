# -*- coding=UTF-8 -*-
"""Provide image information.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import errno
import logging

from flask import send_file

import cgtwq

from . import core
from ..core import APP
from ..filename import filter_filename

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

    with core.database_session() as sess:
        video = core.get_video(uuid, sess)
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


def _get_note_url_template(select):
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
    return note_url_template
