# -*- coding=UTF-8 -*-
"""Run a worker for generation.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from csheet import generation
from wlf import mp_logging
import logging


def main():
    mp_logging.basic_config()
    logging.info('Start generation worker')
    generation.generate_forever()


if __name__ == '__main__':
    main()
