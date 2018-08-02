# -*- coding=UTF-8 -*-
"""Socket io with client.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import time

import sqlalchemy
import sqlalchemy.exc
from gevent import sleep, spawn

from ..core import APP, CELERY, SOCKETIO
from ..database import Meta, Video, session_scope
from ..workertools import worker_concurrency
from .core import database_session

LOGGER = logging.getLogger(__name__)


def _role_updated_criterion(role, since):
    return sqlalchemy.and_(
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
        sqlalchemy.or_(_role_updated_criterion('thumb', since),
                       _role_updated_criterion('preview', since),
                       _role_updated_criterion('poster', since),
                       Video.tags_mtime >= since),
    ).order_by(Video.label)
    result = query.all()
    result = Video.format_videos(result)
    return result


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError,),
             retry_backoff=True)
@worker_concurrency(value=1, is_block=False)
def broadcast_updated_asset(session=None):
    """Broad cast all newly updated asset.

    """

    data_key = 'LastBroadcastTime'
    now = time.time()
    with session_scope(session) as sess:
        since = Meta.get(data_key, default=now)
        data = get_updated_asset(since, sess)
        assert isinstance(data, list), type(data)
        if data:
            SOCKETIO.emit('asset update', data, broadcast=True)
            LOGGER.info('Broadcast updated asset, count: %s', len(data))
        else:
            LOGGER.debug('No updated assets.')
        Meta.set(data_key, now)


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
        sess.query(Video).filter(
            Video.uuid.in_(message),
            sqlalchemy.or_(
                Video.last_update_time.is_(None),
                (Video.last_update_time <
                 time.time() - APP.config['BROADCAST_INTERVAL'])
            ),
            Video.is_need_update.isnot(True),
        ).update({'is_need_update': True},
                 synchronize_session=False)

    LOGGER.debug('Accepted video update requests, count: %s', len(message))


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
        expires=APP.config['BROADCAST_INTERVAL'])
