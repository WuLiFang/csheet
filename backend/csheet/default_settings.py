# -*- coding=UTF-8 -*-
"""Default application settings.  """

from environs import Env

_ENV = Env()

MESSAGE_QUEUE_URL = _ENV('MESSAGE_QUEUE_URL', None)
RESULT_BACKEND_URL = _ENV('RESULT_BACKEND_URL', None)
BACKEND_SENTRY_DSN = _ENV('BACKEND_SENTRY_DSN', None)
FRONTEND_SENTRY_DSN = _ENV('FRONTEND_SENTRY_DSN', None)
STORAGE = _ENV('STORAGE', '/srv/csheet')
DATABASE_URL = _ENV('DATABASE_URL', 'sqlite:///:memory:')

WATCH_INTERVAL = _ENV.int('WATCH_INTERBVAL', 1)
WATCH_CHUNK_SIZE = _ENV.int('WATCH_CHUNK_SIZE', 50)
BROADCAST_INTERVAL = _ENV.int('BROADCAST_INTERVAL', 5)
PREVIEW_SIZE_LIMIT = _ENV.int('PREVIEW_SIZE_LIMIT', 10 * 2 ** 20)  # 10MB
DAEMON_TASK_EXPIRES = _ENV.int('DAEMON_TASK_EXPIRES', 3)
MAX_TASK_TIME = _ENV.int('MAX_TASK_TIME', 60 * 60)  # 1 hour
COOKIE_LIFE = _ENV.int('COOKIE_LIFE', 60 * 60 * 24 * 90)  # 3 mounth

STANDALONE = _ENV.bool('STANDALONE', False)
DEBUG_SQL = _ENV.bool('DEBUG_SQL', False)
LOCAL_MODE = _ENV.bool('LOCAL_MODE', False)
USE_X_SENDFILE = _ENV.bool('USE_X_SENDFILE', False)

LOGGING_CONFIG = {'version': 1,
                  'disable_existing_loggers': True,
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
                      'csheet': {
                          'level': 'INFO',
                          'propagate': True
                      },
                  },
                  'root': {
                      'handlers': ['stream'],
                      'level': 'WARNING',
                  }, }

CELERY_CONFIG = {
    'accept_content': ['json'],
    'task_serializer': 'json',
    'enable_utc': True,
    'timezone': 'UTC',
    'broker_url': MESSAGE_QUEUE_URL,
    'result_backend': RESULT_BACKEND_URL,
    'worker_hijack_root_logger': False,
}
