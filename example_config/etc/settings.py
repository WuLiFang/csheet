# -*- coding=UTF-8 -*-
"""Csheet settings for docker.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os

ENGINE_URL = 'sqlite:////var/db/csheet.db'
MESSAGE_QUEUE = 'redis://redis/0'
PREVIEW_SIZE_LIMIT = 20 * 2 ** 20  # 20MB
with open(os.path.join(os.path.dirname(__file__), 'SENTRY_DSN')) as f:
    SENTRY_DSN = f.read()

CELERY_CONFIG = {
    'accept_content': ['json'],
    'task_serializer': 'json',
    'broker_url': 'redis://redis/1',
    'result_backend': 'redis://redis/2',
    'worker_hijack_root_logger': False
}

LOGGING_CONFIG = {'version': 1,
                  'disable_existing_loggers': True,
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
                      'sentry': {
                          'level': 'ERROR',
                          'class': 'raven.handlers.logging.SentryHandler',
                          'dsn': SENTRY_DSN,
                      },
                  },
                  'loggers': {
                      'csheet': {
                          'level': 'INFO',
                          'propagate': True
                      },
                  },
                  'root': {
                      'handlers': ['stream', 'sentry'],
                      'level': 'WARNING',
                  }, }
