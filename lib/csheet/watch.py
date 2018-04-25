# -*- coding=UTF-8 -*-
"""Watch video mtime.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import time
from contextlib import closing
from multiprocessing.dummy import Process

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
            Video.is_need_update.is_(True)).first()
        if video is None:
            return False
        assert isinstance(video, Video), type(video)

        LOGGER.debug('Update video info: %s', video)
        if video.src:
            try:
                video.src_mtime = getmtime(video.src)
            except OSError:
                pass
        if video.poster:
            try:
                video.poster_mtime = getmtime(video.poster)
            except OSError:
                pass
        video.is_need_update = False
        video.last_update_time = time.time()
        session.commit()
        return True


def update_forever():
    """Run as generate worker.  """

    while True:
        try:
            if not update_one():
                time.sleep(1)
        except (KeyboardInterrupt, SystemExit):
            return
        except:  # pylint: disable=bare-except
            LOGGER.error(
                'Error during generation.', exc_info=True)


def start():
    """Start generation thread.  """

    process = Process(name='Updating', target=update_forever)
    process.daemon = True
    process.start()
