# -*- coding=UTF-8 -*-
"""Cache operation result.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import tempfile
from os.path import join

import diskcache

CACHE = diskcache.FanoutCache(join(tempfile.gettempdir(), 'csheet', __name__))
