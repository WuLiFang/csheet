# -*- coding=UTF-8 -*-
"""Socket io with client.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import time

from gevent import sleep, spawn

from .. import setting
from .app import APP, SOCKETIO

LOGGER = logging.getLogger()


def broadcast_new_asset(since):
    data = 'dummy_data since:{}'.format(since)
    SOCKETIO.emit('new asset', data, broadcast=True)
    LOGGER.debug('Broadcast new asset')


def broadcast_forever():
    last_broadcast_time = time.time() - 10
    while True:
        broadcast_new_asset(since=last_broadcast_time)
        last_broadcast_time = time.time()
        sleep(setting.BROADCAST_INTERVAL, False)


@SOCKETIO.on('connect')
def on_connect():
    LOGGER.debug('connected')


@APP.before_first_request
def start_broadcast():
    spawn(broadcast_forever)
    LOGGER.debug('Start broadcast')
