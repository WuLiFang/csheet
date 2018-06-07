# -*- coding=UTF-8 -*-
"""Socket io with client.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import time

from gevent import sleep, spawn
from sqlalchemy import and_, or_

from .. import setting
from ..database import Video, session_scope
from .app import APP, SOCKETIO
from .core import database_session

LOGGER = logging.getLogger()


def _role_updated_criterion(role, since):
    return and_(
        getattr(Video, role).isnot(None),
        getattr(Video, '{}_mtime'.format(role)).isnot(None),
        getattr(Video, '{}_atime'.format(role)) >= since,
    )


def get_updated_asset(since, sess):
    """Get all newly updated asset from local database.

    Args:
        since (float): Timestamp
    """

    query = sess.query(Video).filter(
        or_(_role_updated_criterion('thumb', since),
            _role_updated_criterion('preview', since),
            _role_updated_criterion('poster', since),
            Video.tags_mtime >= since),
    ).order_by(Video.label)
    result = query.all()
    result = Video.format_videos(result)
    return result


def broadcast_updated_asset(since, session):
    """Broad cast all newly updated asset.

    Args:
        since (float): Timestamp
    """

    data = get_updated_asset(since, session)
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
        with session_scope() as sess:
            broadcast_updated_asset(since=last_broadcast_time, session=sess)
        last_broadcast_time = time.time()
        sleep(setting.BROADCAST_INTERVAL, False)


@SOCKETIO.on('connect')
def on_connect():
    LOGGER.debug('connected')


@SOCKETIO.on('request update')
def on_request_update(message):
    assert isinstance(message, list), type(message)
    with database_session() as sess:
        query = sess.query(Video).filter(
            Video.uuid.in_(message),
            Video.last_update_time < time.time() - setting.BROADCAST_INTERVAL,
            Video.is_need_update != True,
        )
        videos = query.all()
        if not videos:
            return

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
