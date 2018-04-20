# -*- coding=UTF-8 -*-
"""Web app configuration.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os

from flask import Flask
from raven.contrib.flask import Sentry

from ..__about__ import __name__ as name
from ..__about__ import __version__

APP = Flask(name)
APP.secret_key = ('}w\xb7\xa3]\xfaI\x94Z\x14\xa9\xa5}\x16\xb3'
                  '\xf7\xd6\xb2R\xb0\xf5\xc6*.\xb3I\xb7\x066V\xd6\x8d')
APP.config['version'] = __version__
APP.config['preview_limit_size'] = 10 * 2 ** 20  # 10MB
APP.config['storage'] = os.getenv('CSHEET_STORAGE')
SENTRY = Sentry(APP, logging=True,
                level=logging.WARNING)


@APP.route('/test_sentry')
def _runtime_error():
    logging.error('test2')
    raise RuntimeError('test', __name__)
