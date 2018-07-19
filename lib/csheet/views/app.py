# -*- coding=UTF-8 -*-
"""Web app configuration.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os

from flask import Flask
from flask_socketio import SocketIO
from raven.contrib.flask import Sentry

from .. import filetools, setting
from ..__about__ import __name__ as name
from ..__about__ import __version__

APP = Flask(name, root_path=filetools.dist_path())
APP.secret_key = ('}w\xb7\xa3]\xfaI\x94Z\x14\xa9\xa5}\x16\xb3'
                  '\xf7\xd6\xb2R\xb0\xf5\xc6*.\xb3I\xb7\x066V\xd6\x8d')
APP.config['version'] = __version__
APP.config['preview_limit_size'] = 10 * 2 ** 20  # 10MB
APP.config['storage'] = os.getenv('CSHEET_STORAGE')
if os.getenv('CSHEET_DEBUG'):
    logging.basicConfig(level=logging.DEBUG)
else:
    def _set_default_encoding(encoding):
        # XXX: need more clean way to fix sentry encoding error.
        import sys
        reload(sys)
        sys.setdefaultencoding(encoding)
    _set_default_encoding('utf-8')

    SENTRY = Sentry(APP, logging=bool(os.getenv('SENTRY_DSN')),
                    level=logging.WARNING)

SOCKETIO = SocketIO(APP, path='/api/socket.io',
                    message_queue=setting.BROKER_URI if setting.BROKER_URI else None)


@APP.route('/test_sentry')
def _runtime_error():
    logging.error('test2')
    raise RuntimeError('test', __name__)
