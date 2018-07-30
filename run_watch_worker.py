# -*- coding=UTF-8 -*-
"""Run a worker for watch files.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging

from csheet import core, watch


def main():
    core.init()
    logging.info('Start watch worker')
    watch.update_forever()


if __name__ == '__main__':
    main()
