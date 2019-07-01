#!/usr/bin/env python3
# -*- coding=UTF-8 -*-
"""csheet(colorsheet/contactsheet) CLI.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import socket
import webbrowser

import fire

from wlf import mp_logging
from wlf.singleton import SingleInstance

from . import database
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


def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 1))  # connect() for UDP doesn't send packets
    return s.getsockname()[0]


def get_avaliable_port(host, port=0, family=socket.AF_INET, type_=socket.SOCK_STREAM):
    sock = socket.socket(family, type_)
    try:
        sock.bind((host, port))
    except OSError:
        return get_avaliable_port(host, port+1, family, type_)
    ret = sock.getsockname()[1]
    sock.close()
    return ret


def runserver(host='0.0.0.0', port=80):
    """Run csheet server forever.
        host (str, optional): Defaults to '0.0.0.0'. Listenling host ip.
        port (int, optional): Defaults to 80. Listenling port.
    """
    dummy = SingleInstance()
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

    port = get_avaliable_port(host, port)

    address = 'http://{}:{}'.format(get_local_ip()
                                    if host == '0.0.0.0' else host, port)
    print(address)
    LOGGER.info('服务器运行于: %s', address)
    webbrowser.open(address)

    SOCKETIO.run(APP, host, port, debug=False)


if __name__ == '__main__':
    fire.Fire(name='csheet')
