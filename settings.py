# -*- coding=UTF-8 -*-
"""Csheet settings for docker.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

ENGINE_URL = 'sqlite:////var/db/csheet.db'
BROKER_URL = 'redis://redis/0'
MESSAGE_QUEUE = 'redis://redis/1'
SENTRY_DSN = None  # Replace your value
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
