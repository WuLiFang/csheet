# -*- coding=UTF-8 -*-
"""Contactsheet test.  """
from __future__ import absolute_import, print_function, unicode_literals

import logging

from csheet import util
from csheet.views import APP
from wlf import mp_logging


def main():
    mp_logging.basic_config(level=logging.DEBUG)
    util.set_locale()

    APP.run('localhost', 5001, True)
    # port = 5001
    # APP.debug = True
    # server = WSGIServer(('localhost', port), APP)
    # APP.logger.debug('Server ready')
    # server.serve_forever()


if __name__ == '__main__':
    main()
