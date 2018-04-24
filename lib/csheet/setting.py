# -*- coding=UTF-8 -*-
"""Csheet settings.  """
import os

PREVIEW_SIZE_LIMIT = 10 * 2 ** 20   # 10MB
STORAGE = os.getenv('CSHEET_STORAGE')
DATABASE = os.getenv('CSHEET_DATABASE', 'sqlite:///:memory:')
