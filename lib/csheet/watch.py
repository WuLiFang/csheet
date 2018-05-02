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
    try:
        return os.path.getmtime(e(path))
    except OSError:
        LOGGER.warning('File removed: %s', path)
    return None


def update_one():
    """Generate one not generated video"""

    session = Session()

    with closing(session):
        videos = session.query(Video).filter(
            Video.is_need_update.is_(True),
            Video.src.isnot(None) | Video.poster.isnot(None),
            or_(Video.last_update_time.is_(None),
                Video.last_update_time < time.time() - 1)
        ).order_by(Video.last_update_time).limit(50).all()
        if not videos:
            LOGGER.debug('Nothing to update')
            return False

        current_time = time.time()
        for i in videos:
            assert isinstance(i, Video), type(i)
            i.is_need_update = False
            i.last_update_time = current_time
        session.commit()

        pathdata = {i: (i.poster, i.src) for i in videos}

    LOGGER.info('Start update videos, count: %s', len(videos))
    mtimedata = {i: [getmtime(j) for j in pathdata[i]] for i in pathdata}

    for i in mtimedata:
        i.poster_mtime, i.src_mtime = mtimedata[i]

    sess = Session()
    with closing(sess):
        sess.add_all(videos)
        sess.commit()

    return True


def update_forever():
    """Run as generate worker.  """

    while True:
        try:
            sleep(0 if update_one() else 1, ref=False)
        except (KeyboardInterrupt, SystemExit):
            return
        except:  # pylint: disable=bare-except
            LOGGER.error(
                'Error during update.', exc_info=True)


def start():
    """Start generation thread.  """

    spawn(update_forever)
