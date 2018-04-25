# -*- coding=UTF-8 -*-
"""Contactsheet test.  """
from __future__ import absolute_import, print_function, unicode_literals

import logging

import generate_test_page

from csheet import generation, APP, watch
from wlf import mp_logging
from util import setup


def main():
    mp_logging.basic_config(level=logging.DEBUG)
    setup()

    generate_test_page.main()

    port = 5001
    APP.debug = True
    generation.start()
    watch.start()

    APP.run('localhost', port, True)


if __name__ == '__main__':
    main()
