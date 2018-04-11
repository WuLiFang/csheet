# -*- coding=UTF-8 -*-
"""Contactsheet test.  """
from __future__ import absolute_import, print_function, unicode_literals

import logging

from gevent.pywsgi import WSGIServer

from csheet.views import APP
from wlf import mp_logging


def main():
    mp_logging.basic_config(level=logging.DEBUG)
    APP.config['storage'] = 'D:\\docker_serve\\csheet'
    # APP.run('localhost', 5001, True)
    port = 5001
    APP.debug = True
    server = WSGIServer(('localhost', port), APP)
    APP.logger.debug('Server ready')
    server.serve_forever()


if __name__ == '__main__':
    import generate_test_page
    generate_test_page.main()
    main()
