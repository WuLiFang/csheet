# -*- coding=UTF-8 -*-
"""Default application settings.  """

HOST = '0.0.0.0'
PORT = 80
MESSAGE_QUEUE = None
SENTRY_DSN = None

STORAGE = '/srv/csheet'
ENGINE_URL = 'sqlite:////srv/csheet/csheet.db'
BROADCAST_INTERVAL = 5
PREVIEW_SIZE_LIMIT = 10 * 2 ** 20  # 10MB
WATCH_INTERVAL = 1
GENERATION_DISCOVER_INTERVAL = 5
WATCH_CHUNK_SIZE = 50
DAEMON_TASK_EXPIRES = 3
COOKIE_LIFE = 60 * 60 * 24 * 90  # 3 mounth

IS_STANDALONE = False
DEBUG_SQL = False
IS_LOCAL_MODE = False
LOGGING_CONFIG = {'version': 1,
                  'disable_existing_loggers': False,
                  'formatters': {
                      'standard': {
                          'format': '%(levelname)-7s[%(asctime)s]:%(name)s: %(message)s'
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
CELERY_CONFIG = {
    'accept_content': ['json'],
    'task_serializer': 'json',
}
