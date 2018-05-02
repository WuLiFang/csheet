# -*- coding=UTF-8 -*-
"""Watch video mtime.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import time
from contextlib import closing

from gevent import sleep, spawn
from sqlalchemy import or_

from wlf.path import get_encoded as e

from .filename import filter_filename
from .model import Session, Video

LOGGER = logging.getLogger(__name__)


def getmtime(path):
    """Get mtime for database path.  """

    path = filter_filename(path)
    return os.path.getmtime(e(path))


def update_one():
    """Generate one not generated video"""

    session = Session()

    with closing(session):
        video = session.query(Video).filter(
            Video.is_need_update.is_(True),
            Video.src.isnot(None) | Video.poster.isnot(None),
            or_(Video.last_update_time.is_(None),
                Video.last_update_time < time.time() - 1)
        ).order_by(Video.last_update_time).first()
        if video is None:
            LOGGER.debug('Nothing to update')
            return False
        assert isinstance(video, Video), type(video)
        video.is_need_update = False
        video.last_update_time = time.time()
        session.commit()

        LOGGER.debug('Update video info: %s', video)
        src, poster = video.src, video.poster
        if src:
            try:
                video.src_mtime = getmtime(src)
            except OSError:
                LOGGER.warning('File removed: %s', src)
                video.src = None
        if poster:
            try:
                video.poster_mtime = getmtime(poster)
            except OSError:
                LOGGER.warning('File removed: %s', poster)
                video.poster = None
        session.commit()
        return True


def update_forever():
    """Run as generate worker.  """

    while True:
        try:
            sleep(0 if update_one() else 1)
        except (KeyboardInterrupt, SystemExit):
            return
        except:  # pylint: disable=bare-except
            LOGGER.error(
                'Error during update.', exc_info=True)


def start():
    """Start generation thread.  """

    spawn(update_forever)
