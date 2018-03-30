# -*- coding=UTF-8 -*-
"""Cache operation result.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os
import tempfile

import diskcache

from .filename import filter_filename

CACHE = diskcache.FanoutCache(os.path.join(
    tempfile.gettempdir(), 'csheet', __name__))


@CACHE.memoize('mtime', expire=1)
def getmtime(filename):
    """Cached `os.path.getmtime`.   """

    filename = filter_filename(filename)
    return os.path.getmtime(filename)
