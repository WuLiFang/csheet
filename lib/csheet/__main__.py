#! /usr/bin/env python2
# -*- coding=UTF-8 -*-
"""csheet(colorsheet/contactsheet) CLI.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import webbrowser

import fire

from wlf import mp_logging
from wlf.path import get_encoded as e

from . import database, filetools, page
from .__about__ import __version__
from .core import APP, CELERY, SOCKETIO

LOGGER = logging.getLogger(__name__)


def _setup_logging(default_level=logging.INFO):
    try:
        mp_logging.basic_config(
            level=logging.getLevelName(os.getenv('LOGLEVEL')))
    except ValueError:
        mp_logging.basic_config(level=default_level)


def serve(host='0.0.0.0', port=80, storage='/srv/csheet'):
    """Run csheet server forever.
        port (int, optional): Defaults to 80. Listenling port.
        storage (str, optional): Defaults to '/srv/csheet'. Storage path.
    """

    _setup_logging()
    APP.config['STORAGE'] = storage
    APP.config['ENGINE_URL'] = 'sqlite:///{}\\csheet.db'.format(storage)
    CELERY.conf['task_always_eager'] = True
    APP.config['IS_STANDALONE'] = True

    address = 'https://{}:{}'.format(host, port)
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
