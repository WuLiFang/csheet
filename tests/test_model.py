# -*- coding=UTF-8 -*-
"""Test module `model`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from csheet import model


def test_video():
    video1 = model.Video('test')
    video2 = model.Video.from_uuid(video1.uuid)
    assert video2.src == 'test'
    assert video2.poster is None
