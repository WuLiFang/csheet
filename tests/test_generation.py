# -*- coding=UTF-8 -*-
"""Test module `model`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import util
from csheet import generation, database, setting


def setup():
    """Setup test env.  """

    storage = util.path('storage')
    database.core.bind('sqlite:///{}\\csheet.db'.format(storage))
    setting.STORAGE = storage


def test_execute_generate_task():
    setup()
    with database.session_scope() as sess:
        for i in generation.GENERATION_TASKS:
            generation.execute_generate_task(sess, **i)
