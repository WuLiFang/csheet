# -*- coding=UTF-8 -*-
"""Csheet settings for docker.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

ENGINE_URL = 'sqlite:////var/db/csheet.db'
MESSAGE_QUEUE = 'redis://redis/0'

with open('SENTRY_DSN') as f:
    SENTRY_DSN = f.read()

CELERY_CONFIG = {
    'accept_content': ['json', 'pickle'],
    'task_serializer': 'pickle',
    'broker_url': 'redis://redis/1',
    'result_backend': 'redis://redis/2',
}

LOGGING_CONFIG = {'version': 1,
                  'disable_existing_loggers': True,
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
                      'sentry': {
                          'level': 'ERROR',
                          'class': 'raven.handlers.logging.SentryHandler',
                          'dsn': SENTRY_DSN,
                      },
                  },
                  'loggers': {
                      '': {
                          'handlers': ['stream', 'sentry'],
                          'level': 'INFO',
                          'propagate': True
                      },
                  }}
