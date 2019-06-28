# -*- coding=UTF-8 -*-
"""Page related task.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging

import cgtwq

from .. import database
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


def _update_page(page_getter):
    page: core.BasePage = page_getter()

    LOGGER.info('Start update page: %s', page)
    with database.session_scope() as sess:
        page.update(sess)
    SOCKETIO.emit('page update', page.id)
    LOGGER.info('Page updated: %s', page)
