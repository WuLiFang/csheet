# -*- coding=UTF-8 -*-
"""Core functionality for web views.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import g

from ..model import Session, session_scope


def database_session():
    """Get database session.  """

    if not hasattr(g, 'database_session'):
        g.database_session = Session()
    sess = g.database_session

    return session_scope(sess)
