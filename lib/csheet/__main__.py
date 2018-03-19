#! /usr/bin/env python2
# -*- coding=UTF-8 -*-
"""GUI for csheet creation.  """
from __future__ import print_function, unicode_literals

import logging
import webbrowser

from wlf import mp_logging
from wlf.path import Path

from .__about__ import __version__
from . import util

LOGGER = logging.getLogger('com.wlf.csheet')


def run_server(port=5000, local_dir=None):
    """Run csheet server at @port.  """

    from gevent.wsgi import WSGIServer
    from .views import APP
    from socket import gethostname, gethostbyname

    util.set_locale()
    APP.config['local_dir'] = local_dir

    host_ip = gethostbyname(gethostname())
    server = WSGIServer(('0.0.0.0', port), APP, log=None)
    address = 'https://{}:{}'.format(host_ip, port)
    print(address)
    LOGGER.info('服务器运行于: %s', address)
    server.serve_forever()

    return (host_ip, port)


def main():
    import argparse
    desc = '吾立方色板工具 {}'.format(__version__)
    parser = argparse.ArgumentParser(description=desc)
    parser.add_argument('-d', '--dir', metavar='目录', required=False,
                        help='包含色板所需图像的目录')
    parser.add_argument('-p', '--port', metavar='端口', type=int, required=False,
                        help='服务器运行端口')
    parser.add_argument('-s', '--storage', metavar='文件仓库路径',
                        type=lambda x: unicode(Path(x)), required=False,
                        help='生成的文件集中存放至此')
    args = parser.parse_args()

    mp_logging.basic_config(level=logging.INFO)
    if args.storage:
        from .views import APP
        APP.config['storage'] = args.storage
    if args.port:
        return run_server(args.port, args.dir)
    elif args.dir:
        from . import create_html_from_dir
        result = create_html_from_dir(args.dir)
        LOGGER.info('生成色板: %s', result)
        print(result)
        webbrowser.open(str(result))
        return

    from . import dialog
    dialog.show()


if __name__ == '__main__':
    main()
