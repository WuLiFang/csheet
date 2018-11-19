# -*- coding=UTF-8 -*-
"""Page related task.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging

import sqlalchemy.exc

from . import core
from .. import database
from ..core import CELERY, SOCKETIO

LOGGER = logging.getLogger(__name__)


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError,),
             retry_backoff=True)
def update_base_page(id_):
    """Update base page data.  """

    _update_page(lambda: core.page_from_id(id_))


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError,),
             retry_backoff=True)
def update_cgteamwork_page(id_, token):
    """Update cgteamwork page data.  """

    _update_page(lambda: core.page_from_id(id_, token=token))


def _update_page(page_getter):
    page: core.BasePage = page_getter()

    LOGGER.info('Start update page: %s', page)
    with database.session_scope() as sess:
        try:
            page.update(sess)
            SOCKETIO.emit('page update', page.id)
        except:
            LOGGER.error('Page update failed.', exc_info=True)
            raise
    LOGGER.info('Page updated: %s', page)
