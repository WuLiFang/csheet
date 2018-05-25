# -*- coding=UTF-8 -*-
"""Cgteamwork data model.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from collections import namedtuple


ProjectInfo = namedtuple('ProjectInfo', ('project', 'code', 'database'))
