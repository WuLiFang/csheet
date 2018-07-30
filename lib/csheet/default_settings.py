# -*- coding=UTF-8 -*-
"""Default application settings.  """

ENGINE_URL = 'sqlite:///:memory:'
BROKER_URL = None
MESSAGE_QUEUE = None
SENTRY_DSN = None

STORAGE = '/srv/csheet'
BROADCAST_INTERVAL = 5
PREVIEW_SIZE_LIMIT = 10 * 2 ** 20  # 10MB

DEBUG_SQL = False
LOGGING_CONFIG = {'version': 1,
                  'disable_existing_loggers': False,
                  'formatters': {
                      'standard': {
                          'format': '%(levelname)-6s[%(asctime)s]:%(name)s: %(message)s'
                      },
                  },
                  'handlers': {
                      'stream': {
                          'level': 'INFO',
                          'formatter': 'standard',
                          'class': 'logging.StreamHandler',
                      },
                  },
                  'loggers': {
                      '': {
                          'handlers': ['stream'],
                          'level': 'INFO',
                          'propagate': True
                      },
                  }}
