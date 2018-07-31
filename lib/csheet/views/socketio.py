# -*- coding=UTF-8 -*-
"""Socket io with client.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import time

from gevent import sleep, spawn
from sqlalchemy import and_, or_

from ..core import APP, CELERY, SOCKETIO
from ..database import Meta, Video, session_scope
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


@CELERY.task(ignore_result=True)
def broadcast_updated_asset(session=None):
    """Broad cast all newly updated asset.

    """

    data_key = 'LastBroadcastTime'
    now = time.time()
    with session_scope(session) as sess:
        since = Meta.get(data_key, sess, default=now)
        data = get_updated_asset(since, sess)
        assert isinstance(data, list), type(data)
        if data:
            SOCKETIO.emit('asset update', data, broadcast=True)
            LOGGER.info('Broadcast updated asset, count: %s', len(data))
        else:
            LOGGER.debug('No updated assets.')
        Meta.set(data_key, now, sess)


def broadcast_forever():
    """Start broadcast.  """

    while True:
        broadcast_updated_asset()
        sleep(APP.config['BROADCAST_INTERVAL'], False)


@SOCKETIO.on('connect')
def on_connect():
    LOGGER.debug('connected')


@SOCKETIO.on('request update')
def on_request_update(message):
    assert isinstance(message, list), type(message)
    with database_session() as sess:
        query = sess.query(Video).filter(
            Video.uuid.in_(message),
            (Video.last_update_time < time.time()
             - APP.config['BROADCAST_INTERVAL']),
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

    if APP.testing:
        spawn(broadcast_forever)
        LOGGER.debug('Start broadcast')


@CELERY.on_after_configure.connect
def setup_periodic_tasks(sender, **_):
    """Setup periodic tasks.  """

    sender.add_periodic_task(
        APP.config['BROADCAST_INTERVAL'],
        broadcast_updated_asset,
        expires=APP.config['DAEMON_TASK_EXPIRES'])
