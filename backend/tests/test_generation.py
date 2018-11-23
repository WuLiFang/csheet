# -*- coding=UTF-8 -*-
"""Test module `model`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from csheet import generation


def test_discover_generate_task():
    generation.discover_tasks()
