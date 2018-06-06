# -*- coding=UTF-8 -*-
"""Csheet settings.  """
import os

PREVIEW_SIZE_LIMIT = 10 * 2 ** 20   # 10MB
STORAGE = os.getenv('CSHEET_STORAGE')
ENGINE_URI = os.getenv('CSHEET_ENGINE_URI', 'sqlite:///:memory:')
BROADCAST_INTERVAL = 5
