#! /usr/bin/env python2
# -*- coding=UTF-8 -*-
"""csheet(colorsheet/contactsheet) CLI.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import webbrowser

import fire

import cgtwq
from wlf import mp_logging
from wlf.path import get_encoded as e

from . import database, filetools, page
from .__about__ import __version__
from .core import APP, SOCKETIO, init

LOGGER = logging.getLogger(__name__)


def _setup_logging(default_level=logging.INFO):
    try:
        mp_logging.basic_config(
            level=logging.getLevelName(os.getenv('LOGLEVEL')))
    except ValueError:
        mp_logging.basic_config(level=default_level)


def clear_lock():
    """Clear database lock.  """

    with database.session_scope() as sess:
        sess.query(database.Meta).filter(
            database.Meta.key.startswith('Lock-')
        ).delete(synchronize_session=False)


def serve(host=None, port=None, storage=None):
    """Run csheet server forever.
        host (int, optional): Defaults to None. Listenling host ip.
        port (int, optional): Defaults to None. Listenling port.
        storage (str, optional): Defaults to None. Storage path.
    """

    host = host or APP.config['HOST']
    port = port or APP.config['PORT']
    _setup_logging()
    if storage:
        APP.config['STORAGE'] = storage
    try:
        os.makedirs(APP.config['STORAGE'])
    except OSError:
        pass
    APP.config['ENGINE_URL'] = 'sqlite:///{}/csheet.db'.format(
        APP.config['STORAGE'])
    APP.config['IS_STANDALONE'] = True
    if not cgtwq.DesktopClient().executable():
        LOGGER.info('未安装CGTeamWork, 将以本地模式运行')
        APP.config['IS_LOCAL_MODE'] = True
    APP.config['CELERY_CONFIG']['task_always_eager'] = True
    init()

    address = 'http://{}:{}'.format(host, port)
    print(address)
    LOGGER.info('服务器运行于: %s', address)

    SOCKETIO.run(APP, host, port, debug=False)


def _render(root):
    """Render page for a folder """

    # TODO: Implement static page.
    page_ = page.LocalPage(root)
    page_.static_folder = filetools.path('static')
    with database.session_scope() as sess:
        page_.update(sess)
        html = page_.render(page_.videos(sess))

    target = os.path.join(os.path.abspath(
        os.path.dirname(root)), '{}.html'.format(page_.title))
    with open(e(target), 'w') as f:
        f.write(html.encode('utf-8'))
    LOGGER.info('生成色板: %s', target)
    print(target)
    webbrowser.open(e(target))


if __name__ == '__main__':
    fire.Fire(name='csheet')
