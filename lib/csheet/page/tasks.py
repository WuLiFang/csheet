# -*- coding=UTF-8 -*-
"""Page related task.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging

import sqlalchemy.exc

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

    _update_page('page.tasks.update_local_page-{}'.format(root),
                 lambda: LocalPage(root))


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError,),
             retry_backoff=True)
def update_cgteamwork_page(project, pipeline, prefix, token):
    """Update cgteamwork page data.  """

    _update_page(
        'page.tasks.update_cgteamwork_page-{}'.format(
            '_'.join([project, pipeline, prefix])),
        lambda: CGTeamWorkPage(project, pipeline, prefix, token))


def _update_page(lock_name, page_getter):
    @database_single_instance(lock_name, is_block=False)
    def _run():
        page = page_getter()
        LOGGER.debug('Update page: %s', page)
        with database.session_scope() as sess:
            page.update(sess)
    _run()
