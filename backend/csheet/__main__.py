#!/usr/bin/env python3
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
from .core import APP, SOCKETIO, init

LOGGER = logging.getLogger(__name__)


def _setup_logging(default_level=logging.INFO):
    try:
        mp_logging.basic_config(
            level=logging.getLevelName(os.getenv('LOGLEVEL')))
    except ValueError:
        mp_logging.basic_config(level=default_level)


def _fix_broken_mtime(target, sess):
    path_column = getattr(database.Video, f'{target}')
    mtime_column = getattr(database.Video, f'{target}_mtime')
    query = sess.query(database.Video).filter(path_column.is_(None),
                                              mtime_column.isnot(None))
    print(f'File that {target} mtime without a path: {query.count()}')
    query.update({f'{target}_mtime': None},
                 synchronize_session=False)


def health_check():
    """Do database health check.  """

    with database.session_scope(is_close=True) as sess:
        _fix_broken_mtime('thumb', sess)
        _fix_broken_mtime('poster', sess)
        _fix_broken_mtime('preview', sess)
        _fix_broken_mtime('src', sess)


def clear_lock():
    with database.session_scope(is_close=True) as sess:
        sess.query(database.Video).update(
            {'generation_started': None},
            synchronize_session=False
        )


def runserver(host='0.0.0.0', port=80):
    """Run csheet server forever.
        host (str, optional): Defaults to '0.0.0.0'. Listenling host ip.
        port (int, optional): Defaults to 80. Listenling port.
    """

    _setup_logging()

    try:
        os.makedirs(APP.config['STORAGE'])
    except OSError:
        pass
    APP.config['DATABASE_URL'] = 'sqlite:///{}/csheet.db'.format(
        APP.config['STORAGE'])
    APP.config['STANDALONE'] = True
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
