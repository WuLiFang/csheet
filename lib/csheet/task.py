# -*- coding=UTF-8 -*-
"""Celery queue.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging

from . import database
from .core import CELERY

LOGGER = logging.getLogger(__name__)


@CELERY.task(ignore_result=True)
def update_page(page):
    """Update page data.  """

    LOGGER.debug('Update page: %s', page)
    page.update(database.Session())
