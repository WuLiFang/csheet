# -*- coding=UTF-8 -*-
"""Run a worker for generation.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from csheet import core, generation


def main():
    core.init_loggging()
    generation.LOGGER.info('Start generation worker')
    generation.generate_forever()


if __name__ == '__main__':
    main()
