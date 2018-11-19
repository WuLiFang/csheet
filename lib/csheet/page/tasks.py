# -*- coding=UTF-8 -*-
"""Page related task.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging

import sqlalchemy.exc

from . import core
from .. import database
from ..core import CELERY
from ..workertools import database_single_instance
from .cgteamwork import CGTeamWorkPage
from .local import LocalPage

LOGGER = logging.getLogger(__name__)


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError,),
             retry_backoff=True)
def update_local_page(root):
    """Update local page data.  """

    _update_page(lambda: LocalPage(root))


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError,),
             retry_backoff=True)
def update_cgteamwork_page(project, pipeline, prefix, token):
    """Update cgteamwork page data.  """

    _update_page(lambda: CGTeamWorkPage(project, pipeline, prefix, token))


def _update_page(page_getter):
    page: core.BasePage = page_getter()

    @database_single_instance(page.id, is_block=False)
    def _run():
        LOGGER.info('Start update page: %s', page)
        with database.session_scope() as sess:
            try:
                page.update(sess)
            except:
                LOGGER.error('Page update failed.', exc_info=True)
                raise
        LOGGER.info('Page updated: %s', page)
    _run()
