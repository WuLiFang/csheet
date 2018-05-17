# -*- coding=UTF-8 -*-
"""Test module `model`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)
import pytest

import util
from csheet import generation, model, setting


def setup():
    """Setup test env.  """

    storage = util.path('storage')
    model.bind('sqlite:///{}\\csheet.db'.format(storage))
    setting.STORAGE = storage


def test_gen_thumb():
    setup()
    with model.session_scope() as sess:
        generation.generate_one_thumb(sess)


def test_gen_poster():
    setup()
    with model.session_scope() as sess:
        generation.generate_one_poster(sess)


@pytest.mark.skip('May take too long time')
def test_gen_preview():
    setup()
    with model.session_scope() as sess:
        generation.generate_one_preview(sess)
