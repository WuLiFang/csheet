# -*- coding=UTF-8 -*-
"""Socket io with client.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import time

import sqlalchemy
import sqlalchemy.exc

from .core import APP, SOCKETIO
from .database import Video, session_scope

LOGGER = logging.getLogger(__name__)


@SOCKETIO.on('request update')
def on_request_update(message):
    assert isinstance(message, list), type(message)
    with session_scope() as sess:
        (sess
         .query(Video)
         .with_for_update(skip_locked=True)
         .filter(
             Video.uuid.in_(message),
             sqlalchemy.or_(
                 Video.last_update_time.is_(None),
                 (Video.last_update_time < time.time() -
                  APP.config['BROADCAST_INTERVAL'])
             ),
             Video.is_need_update.isnot(True),
         ).update({'is_need_update': True},
                  synchronize_session=False))

    LOGGER.debug('Accepted video update requests, count: %s', len(message))
