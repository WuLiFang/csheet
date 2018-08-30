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
from wlf.path import Path
from wlf.path import get_encoded as e

from . import database, filetools, page
from .__about__ import __version__
from .core import APP, CELERY, SOCKETIO

LOGGER = logging.getLogger(__name__)


def run_server(port=5000, local_dir=None):
    """Run csheet server at @port.  """

    APP.config['local_dir'] = local_dir

    host_ip = gethostbyname(gethostname())
    address = 'https://{}:{}'.format(host_ip, port)
    print(address)
    LOGGER.info('服务器运行于: %s', address)
    SOCKETIO.run(APP, '0.0.0.0', port, debug=False)

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
        CELERY.conf['task_always_eager'] = True
        APP.config['IS_STANDALONE'] = True
        run_server(args.port, args.dir)
    elif args.dir:
        render_staic_page(args.dir)


def render_staic_page(dir_):
    # TODO: Implement static page.
    page_ = page.LocalPage(dir_)
    page_.static_folder = filetools.path('static')
    with database.session_scope() as sess:
        page_.update(sess)
        html = page_.render(page_.videos(sess))

    target = os.path.join(os.path.abspath(
        os.path.dirname(dir_)), '{}.html'.format(page_.title))
    with open(e(target), 'w') as f:
        f.write(html.encode('utf-8'))
    LOGGER.info('生成色板: %s', target)
    print(target)
    webbrowser.open(e(target))


if __name__ == '__main__':
    main()
