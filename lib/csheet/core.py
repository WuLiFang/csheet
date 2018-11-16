# -*- coding=UTF-8 -*-
"""Application core.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import logging.config
import os

from celery import Celery
from flask import Flask
from flask_socketio import SocketIO
from raven.contrib.flask import Sentry

from . import database, filetools
from .__about__ import __name__ as name
from .__about__ import __version__

APP = Flask(name, root_path=filetools.dist_path())
APP.secret_key = os.getenv('SECRET_KEY', ('}w\xb7\xa3]\xfaI\x94Z\x14\xa9\xa5}\x16\xb3'
                                          '\xf7\xd6\xb2R\xb0\xf5\xc6*.\xb3I\xb7\x066V\xd6\x8d'))
APP.config.from_object('csheet.default_settings')
APP.config.from_envvar('CSHEET_SETTINGS', silent=True)

SENTRY = Sentry(APP, dsn=APP.config['BACKEND_SENTRY_DSN'])

SOCKETIO = SocketIO(APP,
                    path='/api/socket.io',
                    MESSAGE_QUEUE_URL=APP.config['MESSAGE_QUEUE_URL'])

CELERY = Celery('csheet')


def init():
    """Initiate application.  """

    logging.config.dictConfig(APP.config['LOGGING_CONFIG'])
    CELERY.config_from_object(APP.config['CELERY_CONFIG'])
    database.core.bind(APP.config['DATABASE_URL'], APP.config['DEBUG_SQL'])


init()
