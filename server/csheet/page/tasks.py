# -*- coding=UTF-8 -*-
"""Page related task.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import typing
from concurrent import futures

import cgtwq

from .. import database, filetools
from ..core import CELERY, SOCKETIO
from . import core

LOGGER = logging.getLogger(__name__)


@CELERY.task(ignore_result=True)
def update_base_page(id_):
    """Update base page data.  """

    _update_page(lambda: core.page_from_id(id_))


@CELERY.task(ignore_result=True)
def update_cgteamwork_page(id_, token):
    """Update cgteamwork page data.  """

    try:
        _update_page(lambda: core.page_from_id(id_, token=token))
    except cgtwq.EmptySelection:
        pass


@CELERY.task(ignore_result=True)
def touch_files(path_list: typing.Iterable[str]) -> None:
    """Touch used files for storage prune

    Args:
        path_list (typing.Iterable[str]): [description]
    """
    path_list = list(path_list)
    with futures.ThreadPoolExecutor() as executor:
        executor.map(filetools.touch, path_list)
    LOGGER.info('Touched files updated: %s', len(path_list))


def _update_page(page_getter):
    page: core.BasePage = page_getter()

    LOGGER.info('Start update page: %s', page)
    with database.session_scope() as sess:
        page.update(sess)
    SOCKETIO.emit('page update', page.id)
    LOGGER.info('Page updated: %s', page)
