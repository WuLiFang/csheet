# -*- coding=UTF-8 -*-
"""Test module `model`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import util
from csheet import database, generation


def test_execute_generate_task():
    util.setup()
    with database.session_scope() as sess:
        for i in generation.GENERATION_TASKS:
            generation.execute_generate_task(sess, **i)
