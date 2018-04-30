# -*- coding=UTF-8 -*-
"""Tools for file operations.   """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os

ROOT = os.path.abspath(os.path.dirname(__file__))


def path(*other):
    """Get path relative to `ROOT`.

    Returns:
        str -- Absolute path under root.
    """

    return os.path.abspath(os.path.join(ROOT, *other))
