# -*- coding=UTF-8 -*-
"""Provide image information.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import errno
import logging

from flask import send_file

import cgtwq

from . import core
from .. import database
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

    sess = database.Session()
    video = core.get_video(uuid, sess)
    path = getattr(video, role)
    if not path:
        if getattr(video, f'{role}_mtime'):
            setattr(video, f'{role}_mtime', None)
            sess.commit()
        return 'No path data for this video role', 404
    try:
        return send_file(filter_filename(path), conditional=True)
    except IOError as ex:
        if (ex.errno == errno.ENOENT
                and role in ('thumb', 'preview')):
            setattr(video, role, None)
            sess.commit()
            return 'No such file', 404
        raise


def _get_note_url_template(select):
    note_url_template = ((
        '{url}/index.php?'
        'controller=v_note'
        '&method=show_page'
        '&db={database}'
        '&module={module}'
        '&task_id=${{taskId}}').format(
            url=cgtwq.core.CONFIG['URL'],
            database=select.module.database.name,
            module=select.module.name))
    return note_url_template
