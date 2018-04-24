# -*- coding=UTF-8 -*-
"""Test module `model`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from csheet import generation, model, setting
import util


def setup():
    """Setup test env.  """

    storage = util.path('storage')
    model.bind('sqlite:///{}\\csheet.db'.format(storage))
    setting.STORAGE = storage


def test_gen_thumb():
    setup()
    generation.generate_one_thumb()


def test_gen_preview():
    setup()
    generation.generate_one_preview()
