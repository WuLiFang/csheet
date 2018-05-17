#! /usr/bin/env python2
# -*- coding=UTF-8 -*-
"""GUI for csheet creation.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import argparse
import logging
import os
import webbrowser
from socket import gethostbyname, gethostname

from wlf import mp_logging
from wlf.path import get_encoded as e
from wlf.path import Path

from . import filetools, generation, model, page, watch
from .__about__ import __version__
from .views import APP, SOCKETIO

LOGGER = logging.getLogger(__name__)


def run_server(port=5000, local_dir=None):
    """Run csheet server at @port.  """

    APP.config['local_dir'] = local_dir

    host_ip = gethostbyname(gethostname())
    address = 'https://{}:{}'.format(host_ip, port)
    print(address)
    LOGGER.info('服务器运行于: %s', address)
    watch.start()
    generation.start()
    SOCKETIO.run(APP, '0.0.0.0', port)

    return (host_ip, port)


def main():

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

    try:
        mp_logging.basic_config(level=os.getenv('LOGLEVEL', logging.INFO))
    except ValueError:
        mp_logging.basic_config(level=logging.INFO)

    if args.port:
        if args.storage:
            APP.config['storage'] = args.storage
        return run_server(args.port, args.dir)
    elif args.dir:
        # TODO: Implement static page.
        page_ = page.LocalPage(args.dir)
        page_.static_folder = filetools.path('static')
        with model.session_scope() as sess:
            page_.update(sess)
            html = page_.render(page_.videos(sess))

        target = os.path.join(os.path.abspath(
            os.path.dirname(args.dir)), '{}.html'.format(page_.title))
        with open(e(target), 'w') as f:
            f.write(html.encode('utf-8'))
        LOGGER.info('生成色板: %s', target)
        print(target)
        webbrowser.open(e(target))
        return


if __name__ == '__main__':
    main()
