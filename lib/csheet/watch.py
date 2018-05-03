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

    if path:
        path = filter_filename(path)
        try:
            return os.path.getmtime(e(path))
        except OSError:
            LOGGER.warning('File removed: %s', path)
    return None


def update_one():
    """Generate one not generated video"""

    session = Session()

    with closing(session):
        current_time = time.time()
        videos = session.query(Video).filter(
            Video.is_need_update.is_(True),
            Video.src.isnot(None) | Video.poster.isnot(None),
            or_(Video.last_update_time.is_(None),
                Video.last_update_time < current_time - 1)
        ).order_by(Video.last_update_time).limit(50).all()
        if not videos:
            LOGGER.debug('Nothing to update')
            return False

        for i in videos:
            assert isinstance(i, Video), type(i)
            i.is_need_update = False
            i.last_update_time = current_time
        session.commit()

        pathdata = {i: (i.poster, i.src) for i in videos}

    LOGGER.info('Start update videos, count: %s', len(videos))
    mtimedata = {i: [getmtime(j) for j in pathdata[i]] for i in pathdata}

    sess = Session()
    with closing(sess):
        for i in mtimedata:
            LOGGER.debug(i.label)
            poster_mtime, src_mtime = mtimedata[i]
            if i.poster_mtime != poster_mtime:
                LOGGER.info('Poster changed: %s: %s -> %s',
                            i, i.poster_mtime, poster_mtime)
                i.poster_mtime = poster_mtime
            if i.src_mtime != src_mtime:
                LOGGER.info('Src changed: %s: %s -> %s',
                            i, i.src_mtime, src_mtime)
                i.src_mtime = src_mtime

        sess.add_all(videos)
        sess.commit()

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
