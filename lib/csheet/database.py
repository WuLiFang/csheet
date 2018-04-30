# -*- coding=UTF-8 -*-
"""Database connection.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
from collections import namedtuple

import cgtwq

LOGGER = logging.getLogger(__name__)


ProjectInfo = namedtuple('ProjectInfo', ('project', 'code', 'database'))


def get_project_info(project, token):
    """Get proejct info for @project.  """

    cgtwq.PROJECT.token = token
    entry = cgtwq.PROJECT.filter(cgtwq.Filter('full_name', project)).to_entry()
    data = entry.get_fields('code', 'database')
    return ProjectInfo(project, *data)
