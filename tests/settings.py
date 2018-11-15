# -*- coding=UTF-8 -*-
"""Test settings.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import cgtwq

import util

TESTING = True
IS_STANDALONE = True
STORAGE = util.path('storage')
ENGINE_URL = 'sqlite:///{}\\csheet.db'.format(STORAGE)
IS_LOCAL_MODE = cgtwq.DesktopClient().executable() is None

CELERY_CONFIG = {
    'accept_content': ['json', 'pickle'],
    'task_serializer': 'pickle',
    'task_always_eager': True
}

LOGGING_CONFIG = {'version': 1,
                  'disable_existing_loggers': False,
                  'formatters': {
                      'standard': {
                          'format': '%(levelname)-7s[%(asctime)s]:%(name)s: %(message)s'
                      },
                  },
                  'handlers': {
                      'stream': {
                          'level': 'DEBUG',
                          'formatter': 'standard',
                          'class': 'logging.StreamHandler',
                      },
                  },
                  'loggers': {
                      '': {
                          'handlers': ['stream'],
                          'level': 'INFO',
                      },
                      'celery.app.trace': {
                          'level': 'INFO',
                      },
                      'csheet': {
                          'level': 'DEBUG',
                          'propagate': True
                      },
                  }}
