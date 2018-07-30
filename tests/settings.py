# -*- coding=UTF-8 -*-
"""Test settings.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import util

TESTING = True
STORAGE = util.path('storage')
ENGINE_URL = 'sqlite:///{}\\csheet.db'.format(STORAGE)

CELERY_CONFIG = {
    'accept_content': ['json', 'pickle'],
    'task_serializer': 'pickle',
    'task_always_eager': True
}

LOGGING_CONFIG = {'version': 1,
                  'disable_existing_loggers': False,
                  'formatters': {
                      'standard': {
                          'format': '%(levelname)-6s[%(asctime)s]:%(name)s: %(message)s'
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
                          'level': 'DEBUG',
                          'propagate': True
                      },
                  }}
