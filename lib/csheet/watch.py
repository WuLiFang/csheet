# -*- coding=UTF-8 -*-
"""Watch video mtime.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import time

import sqlalchemy
import sqlalchemy.exc
from gevent import spawn

from wlf.path import get_encoded as e

from .core import APP, CELERY
from .database import Video, session_scope
from .exceptions import WorkerIdle
from .filename import filter_filename
from .workertools import work_forever

LOGGER = logging.getLogger(__name__)


def getmtime(path):
    """Get mtime for database path.  """

    if not path:
        return None
    path = filter_filename(path)
    path_e = e(path)
    if not os.path.exists(path_e):
        LOGGER.warning('File removed: %s', path)
        return None
    return os.path.getmtime(path_e)


def update_mtime(video, src_column, mtime_column):
    """Update mtime column from source column

    Args:
        video (Video): Video to update.
        src_column (str): Source column name.
        mtime_column (str): Mtime column name.
    """

    mtime = getmtime(getattr(video, src_column))
    if mtime is not None:
        setattr(video, mtime_column, mtime)
    else:
        # Clear removed filename from database.
        setattr(video, src_column, None)


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError,),
             retry_backoff=True)
def update_one_chunk(size=50, is_strict=True):
    """Get a update chunk then update it.  """

    with session_scope() as sess:
        with sess.no_autoflush:
            chunk = (sess
                     .query(Video)
                     .with_for_update(skip_locked=True)
                     .filter(
                         Video.is_need_update.is_(True),
                         Video.src.isnot(None) | Video.poster.isnot(None),
                         sqlalchemy.or_(Video.last_update_time < time.time() - 1,
                                        Video.last_update_time.is_(None)))
                     .order_by(Video.last_update_time)
                     .limit(size)
                     .all())

            if chunk:
                LOGGER.info('Start check video changes, count: %s', len(chunk))
            else:
                LOGGER.debug('No video need update.')
                if is_strict:
                    raise WorkerIdle

            for i in chunk:
                update_mtime(i, 'src', 'src_mtime')
                update_mtime(i, 'poster', 'poster_mtime')
                i.is_need_update = False
                i.last_update_time = time.time()


def update_forever():
    """Run as watch worker.  """

    work_forever(update_one_chunk, LOGGER, label='update')


@APP.before_first_request
def start():
    """Start watch.  """

    if APP.config['STANDALONE']:
        spawn(update_forever)


@CELERY.on_after_configure.connect
def setup_periodic_tasks(sender, **_):
    """Setup periodic tasks.  """

    sender.add_periodic_task(
        APP.config['WATCH_INTERVAL'],
        update_one_chunk.s(size=APP.config['WATCH_CHUNK_SIZE'],
                           is_strict=False),
        expires=APP.config['WATCH_INTERVAL'])
