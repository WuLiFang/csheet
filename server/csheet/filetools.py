# -*- coding=UTF-8 -*-
"""Tools for file operations.   """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import hashlib
import os
import uuid
from datetime import datetime

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

    return path('../dist', *other)


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


def sha256sum(file_path: str) -> str:
    """Get sha256 hex digest from file path.

    Args:
        path (str): File path

    Returns:
        str: Hex digest
    """
    hasher = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(2 << 20), b''):
            hasher.update(chunk)
    return hasher.hexdigest()


def touch(file_path: str):
    """Update file atime.  """

    os.utime(file_path,
             (datetime.now().timestamp(), os.path.getmtime(file_path)))
