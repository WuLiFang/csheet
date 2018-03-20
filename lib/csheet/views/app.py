# -*- coding=UTF-8 -*-
"""Web app configuration.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from tempfile import gettempdir

from flask import Flask

from ..__about__ import __name__ as name
from ..__about__ import __version__

APP = Flask(name)
APP.config['PACK_FOLDER'] = gettempdir()
APP.secret_key = ('}w\xb7\xa3]\xfaI\x94Z\x14\xa9\xa5}\x16\xb3'
                  '\xf7\xd6\xb2R\xb0\xf5\xc6*.\xb3I\xb7\x066V\xd6\x8d')
APP.config['version'] = __version__
APP.config['preview_limit_size'] = 10 * 2 ** 20  # 10MB
