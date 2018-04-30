# -*- coding=UTF-8 -*-
"""Database connection.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging

import cgtwq

from .exceptions import u_abort

LOGGER = logging.getLogger(__name__)


def get_project_code(project, token):
    """Get proejct code for @project.  """
    cgtwq.PROJECT.token = token
    try:
        return cgtwq.PROJECT.filter(cgtwq.Filter('full_name', project))['code'][0]
    except IndexError:
        u_abort(404, 'No such project.')


def get_database(project, token):
    """Get proejct database for @project.  """
    cgtwq.PROJECT.token = token
    try:
        return cgtwq.PROJECT.filter(cgtwq.Filter('full_name', project))['database'][0]
    except IndexError:
        u_abort(404, 'No such project.')
