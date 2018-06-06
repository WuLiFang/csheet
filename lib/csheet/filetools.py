# -*- coding=UTF-8 -*-
"""Tools for file operations.   """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os
import uuid

from six import PY3

from wlf.path import get_encoded as e
from wlf.path import get_unicode as u

ROOT = os.path.abspath(os.path.dirname(__file__))


def path(*other):
    """Get path relative to this file.

    Returns:
        str -- Absolute path under root.
    """

    return os.path.abspath(os.path.join(ROOT, *other))


def dist_path(*other):
    """Get path relative to dist folder.

    Returns:
        str -- Absolute path under root.
    """

    return path('../../dist', *other)


def uuid_from_path(filepath):
    """Get uuid for path.

    Args:
        path (pathLike object): Image path.

    Returns:
        str: hex uuid.
    """

    if PY3:
        filepath = u(filepath)
    else:
        filepath = e(filepath)
    return uuid.uuid5(uuid.NAMESPACE_URL, filepath).hex
