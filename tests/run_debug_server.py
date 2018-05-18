# -*- coding=UTF-8 -*-
"""Contactsheet test.  """
from __future__ import absolute_import, print_function, unicode_literals

import logging

import generate_test_page

from csheet import generation, APP, watch, SOCKETIO
from wlf import mp_logging
import util

PORT = 5001


def main():

    mp_logging.basic_config(level=logging.DEBUG)
    util.setup()

    generate_test_page.main()

    generation.GENERATION_TASKS.pop()
    generation.start()
    watch.start()

    SOCKETIO.run(APP,
                 'localhost', PORT,
                 debug=True)


if __name__ == '__main__':
    main()
