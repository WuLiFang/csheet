# -*- coding=UTF-8 -*-
"""Run a worker for generation.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import logging.config

from csheet import generation

LOG_CONFIG = {'version': 1,
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
                  'file': {
                      'level': 'INFO',
                      'formatter': 'standard',
                      'class': 'logging.handlers.RotatingFileHandler',
                      'filename': '/var/log/csheet_generation.log',
                      'maxBytes': 102400,
                      'backupCount': 3
                  }
              },
              'loggers': {
                  '': {
                      'handlers': ['stream'],
                      'level': 'INFO',
                      'propagate': True
                  },
                  'csheet.generation': {
                      'handlers': ['file'],
                      'level': 'INFO',
                      'propagate': True
                  },
              }}


def main():
    logging.config.dictConfig(LOG_CONFIG)
    generation.LOGGER.info('Start generation worker')
    generation.generate_forever()


if __name__ == '__main__':
    main()
