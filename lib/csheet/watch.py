# -*- coding=UTF-8 -*-
"""Watch video mtime.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import time

from gevent import spawn
from sqlalchemy import or_

from wlf.path import get_encoded as e

from .core import APP, CELERY
from .database import Video, session_scope
from .exceptions import WorkerIdle
from .filename import filter_filename
from .workertools import database_lock, work_forever

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


class Chunk(list):
    """Chunk for update.  """

    @classmethod
    def get(cls, session, size=50, min_update_interval=1):
        """Get update chunk from local database.
            size (int, optional): Defaults to 50. Chunk size.
            min_update_interval (int, optional): Defaults to 1.
                Ignore newly updated items by seconds.

        Returns:
            Chunk: Chunk for update.
        """

        current_time = time.time()
        videos = session.query(Video).filter(
            Video.is_need_update.is_(True),
            Video.src.isnot(None) | Video.poster.isnot(None),
            or_(Video.last_update_time.is_(None),
                Video.last_update_time < current_time - min_update_interval)
        ).order_by(Video.last_update_time).limit(size).all()

        for i in videos:
            assert isinstance(i, Video), type(i)
            i.is_need_update = False
            i.last_update_time = current_time
        session.commit()

        return cls(videos)

    def update_mtime(self, src_column, mtime_column):
        """Update mtime column from source column

        Args:
            src_column (str): Source column name.
            mtime_column (str): Mtime column name.
        """

        mtimedata = self.get_mtimedata(src_column)
        for k, v in mtimedata.items():
            assert isinstance(k, Video), type(k)
            prev_value = getattr(k, mtime_column)
            if v is None:
                setattr(k, src_column, None)
            elif v != prev_value:
                LOGGER.info('File changed: %s: %s -> %s',
                            src_column, prev_value, v)
                setattr(k, mtime_column, v)

    def get_mtimedata(self, src_column):
        """Get mtime data for a column.

        Args:
            src_column (str): Column name.

        Returns:
            dict[Video: float|None]: Mtime data dictionary.
        """

        pathdata = {i: getattr(i, src_column) for i in self}
        return {k: getmtime(v) for k, v in pathdata.items()}


@CELERY.task(ignore_result=True)
def update_one_chunk(size, is_strict=True):
    """Get a update chunk then update it.  """

    with session_scope() as sess:
        with database_lock(sess, 'update') as acquired:
            if not acquired:
                return
            chunk = Chunk.get(sess, size)
            if not chunk:
                LOGGER.debug('No video need update.')
                if is_strict:
                    raise WorkerIdle
                return
            LOGGER.info('Start update videos, count: %s', len(chunk))
            chunk.update_mtime('src', 'src_mtime')
            chunk.update_mtime('poster', 'poster_mtime')


def update_forever():
    """Run as watch worker.  """

    work_forever(update_one_chunk, LOGGER, label='update')


@APP.before_first_request
def start():
    """Start watch.  """

    if APP.testing:
        spawn(update_forever)


@CELERY.on_after_configure.connect
def setup_periodic_tasks(sender, **_):
    """Setup periodic tasks.  """

    sender.add_periodic_task(
        APP.config['WATCH_INTERVAL'],
        update_one_chunk.s(size=APP.config['WATCH_CHUNK_SIZE'],
                           is_strict=False),
        expire=0.2)
