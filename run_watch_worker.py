# -*- coding=UTF-8 -*-
"""Run a worker for watch files.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from csheet import watch
from wlf import mp_logging
import logging


def main():
    mp_logging.basic_config()
    logging.info('Start watch worker')
    watch.update_forever()


if __name__ == '__main__':
    main()
