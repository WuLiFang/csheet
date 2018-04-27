# -*- coding=UTF-8 -*-
"""Socket io with client.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import time

from gevent import sleep, spawn

from .. import setting
from .app import APP, SOCKETIO
from ..model import Session, Video
from contextlib import closing
LOGGER = logging.getLogger()

from sqlalchemy import or_, and_


def get_new_asset(since):
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
    ret = []
    for i in videos:
        assert isinstance(i, Video)
        row = (i.uuid, i.thumb_mtime, i.poster_mtime, i.preview_mtime, i.label)
        ret.append(row)
    return ret


def broadcast_new_asset(since):
    data = get_new_asset(since)
    assert isinstance(data, list), type(data)
    if data:
        SOCKETIO.emit('asset update', data, broadcast=True)
        LOGGER.debug('Broadcast new asset, count: %s', len(data))
    else:
        LOGGER.debug('No new assets.')


def broadcast_forever():
    last_broadcast_time = time.time() - 10
    while True:
        broadcast_new_asset(since=last_broadcast_time)
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
    spawn(broadcast_forever)
    LOGGER.debug('Start broadcast')
