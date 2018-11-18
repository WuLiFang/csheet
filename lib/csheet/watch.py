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
            sqlalchemy.or_(Video.last_update_time.is_(None),
                           Video.last_update_time < current_time - min_update_interval)
        ).order_by(Video.last_update_time).limit(size).all()

        return cls(videos)

    def update_mtime(self, src_column, mtime_column, session):
        """Update mtime column from source column

        Args:
            src_column (str): Source column name.
            mtime_column (str): Mtime column name.
        """

        mappings = [{'uuid': i.uuid,
                     mtime_column:  getmtime(getattr(i, src_column))}
                    for i in self]
        for i in mappings:
            # Clear removed filename from database.
            if i[mtime_column] is None:
                i[src_column] = None
        session.bulk_update_mappings(Video, mappings)
        session.commit()


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError,),
             retry_backoff=True)
def update_one_chunk(size=50, is_strict=True):
    """Get a update chunk then update it.  """

    with session_scope() as sess:
        chunk = Chunk.get(sess, size)
        if not chunk:
            LOGGER.debug('No video need update.')
            if is_strict:
                raise WorkerIdle
            return
        LOGGER.info('Start check video changes, count: %s', len(chunk))
        chunk.update_mtime('src', 'src_mtime', sess)
        chunk.update_mtime('poster', 'poster_mtime', sess)
        sess.query(Video).filter(
            Video.uuid.in_([i.uuid for i in chunk])
        ).update(
            {'is_need_update': False,
             'last_update_time': time.time()},
            synchronize_session=False
        )


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
