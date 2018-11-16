# -*- coding=UTF-8 -*-
"""Default application settings.  """
from celery.schedules import crontab

MESSAGE_QUEUE = None
SENTRY_DSN = None

STORAGE = '/srv/csheet'
ENGINE_URL = 'sqlite:///:memory:'
BROADCAST_INTERVAL = 5
PREVIEW_SIZE_LIMIT = 10 * 2 ** 20  # 10MB
WATCH_INTERVAL = 1
GENERATION_LIGHT_DISCOVER_SCHEDULE = 5
GENERATION_HEAVY_DISCOVER_SCHEDULE = crontab(minute='*/1', hour='0-1,11-23')

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
    'enable_utc': True,
    'timezone': 'UTC',
}
