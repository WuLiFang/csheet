# -*- coding=UTF-8 -*-
"""Contactsheet test.  """
from __future__ import absolute_import, print_function, unicode_literals

import logging


from csheet import generation, APP, watch
from wlf import mp_logging
from util import setup


def main():
    mp_logging.basic_config(level=logging.DEBUG)
    setup()

    port = 5001
    APP.debug = True
    generation.start()
    watch.start()

    APP.run('localhost', port, True)

    APP.logger.debug('Server ready')


if __name__ == '__main__':
    import generate_test_page
    generate_test_page.main()
    main()
