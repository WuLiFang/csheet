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
from .workertools import try_execute

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
    def get(cls, size=50, min_update_interval=1):
        """Get update chunk from local database.
            size (int, optional): Defaults to 50. Chunk size.
            min_update_interval (int, optional): Defaults to 1.
                Ignore newly updated items by seconds.

        Returns:
            Chunk: Chunk for update.
        """

        session = Session()

        with closing(session):
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
        sess = Session()
        with closing(sess):
            for k, v in mtimedata.items():
                assert isinstance(k, Video), type(k)
                prev_value = getattr(k, mtime_column)
                if v is None:
                    setattr(k, src_column, None)
                elif v != prev_value:
                    LOGGER.info('File changed: %s: %s -> %s',
                                src_column, prev_value, v)
                    setattr(k, mtime_column, v)

            sess.add_all(self)
            sess.commit()

    def get_mtimedata(self, src_column):
        """Get mtime data for a column.

        Args:
            src_column (str): Column name.

        Returns:
            dict[Video: float|None]: Mtime data dictionary.
        """

        sess = Session()
        with closing(sess):
            sess.add_all(self)
            pathdata = {i: getattr(i, src_column) for i in self}
        return {k: getmtime(v) for k, v in pathdata.items()}


def update_one_chunk():
    """Get a update chunk then update it.  """

    chunk = Chunk.get()
    if not chunk:
        LOGGER.debug('No video need update.')
        return False
    LOGGER.info('Start update videos, count: %s', len(chunk))
    chunk.update_mtime('src', 'src_mtime')
    chunk.update_mtime('poster', 'poster_mtime')
    return True


def update_forever():
    """Run as watch worker.  """

    while True:
        success = try_execute(update_one_chunk, LOGGER, 'update')
        sleep(0 if success else 1)


def start():
    """Start watch.  """

    spawn(update_forever)
