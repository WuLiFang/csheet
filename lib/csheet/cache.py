# -*- coding=UTF-8 -*-
"""Cache operation result.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import tempfile
import os
import diskcache

CACHE = diskcache.FanoutCache(os.path.join(
    tempfile.gettempdir(), 'csheet', __name__))


@CACHE.memoize('mtime', expire=1)
def getmtime(filename):
    """Cached `os.path.getmtime`.   """

    return os.path.getmtime(filename)
