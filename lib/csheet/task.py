# -*- coding=UTF-8 -*-
"""Celery queue.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging

from celery import Celery

from . import database, setting

CELERY = Celery('csheet', broker=setting.BROKER_URI)
CELERY.conf.accept_content = ['json', 'pickle']
CELERY.conf.task_serializer = 'pickle'

LOGGER = logging.getLogger(__name__)


@CELERY.task
def update_page(page):
    """Update page data.  """

    LOGGER.debug('Update page: %s', page)
    page.update(database.Session())
