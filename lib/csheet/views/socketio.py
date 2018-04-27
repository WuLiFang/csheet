# -*- coding=UTF-8 -*-
"""Socket io with client.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import time
from contextlib import closing

from gevent import sleep, spawn
from sqlalchemy import and_, or_

from .. import setting
from ..model import Session, Video
from .app import APP, SOCKETIO

LOGGER = logging.getLogger()


def get_updated_asset(since):
    """Get all newly updated asset from local database.

    Args:
        since (float): Timestamp
    """

    sess = Session()
    with closing(sess):
        query = sess.query(Video).filter(
            or_(
                and_(Video.thumb.isnot(None),
                     Video.thumb_mtime.isnot(None),
                     Video.thumb_atime >= since),
                and_(Video.preview.isnot(None),
                     Video.preview_mtime.isnot(None),
                     Video.preview_atime >= since),
                and_(
                    Video.poster.isnot(None),
                    Video.poster_mtime.isnot(None),
                    Video.poster_mtime >= since
                )
            )
        ).order_by(Video.label)
        result = query.all()
        result = format_videos(result)
        return result


def format_videos(videos):
    """Format videos for front end.

    Args:
        videos (list[Video]): Videos to format.

    Returns:
        list[tuple]: Formated video infos.
    """

    ret = []
    for i in videos:
        assert isinstance(i, Video)
        row = (i.uuid, i.thumb_mtime, i.poster_mtime, i.preview_mtime, i.label)
        ret.append(row)
    return ret


def broadcast_updated_asset(since):
    """Broad cast all newly updated asset.

    Args:
        since (float): Timestamp
    """

    data = get_updated_asset(since)
    assert isinstance(data, list), type(data)
    if data:
        SOCKETIO.emit('asset update', data, broadcast=True)
        LOGGER.debug('Broadcast updated asset, count: %s', len(data))
    else:
        LOGGER.debug('No updated assets.')


def broadcast_forever():
    """Start broadcast.  """

    last_broadcast_time = time.time() - 10
    while True:
        broadcast_updated_asset(since=last_broadcast_time)
        last_broadcast_time = time.time()
        sleep(setting.BROADCAST_INTERVAL, False)


@SOCKETIO.on('connect')
def on_connect():
    LOGGER.debug('connected')


@SOCKETIO.on('request update')
def on_request_update(message):
    assert isinstance(message, list), type(message)
    sess = Session()
    with closing(sess):
        query = sess.query(Video).filter(
            Video.uuid.in_(message)
        )
        videos = query.all()
        for i in videos:
            assert isinstance(i, Video)
            i.is_need_update = True
        sess.commit()
        LOGGER.debug('Accepted video update requests, count: %s', len(videos))


@APP.before_first_request
def start_broadcast():
    """Start broadcast.  """

    spawn(broadcast_forever)
    LOGGER.debug('Start broadcast')
