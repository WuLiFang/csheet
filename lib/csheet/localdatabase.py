# -*- coding=UTF-8 -*-
"""Tools for local database.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import uuid

from six import PY3

from wlf.path import get_encoded as e
from wlf.path import get_unicode as u


def uuid_from_path(path):
    """Get uuid for path.

    Args:
        path (pathLike object): Image path.

    Returns:
        str: hex uuid.
    """

    if PY3:
        path = u(path)
    else:
        path = e(path)
    return uuid.uuid5(uuid.NAMESPACE_URL, path).hex
