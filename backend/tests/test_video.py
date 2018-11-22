# -*- coding=UTF-8 -*-
"""Test module `video`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)
from csheet import video
import util


def test_get_path():
    poster = util.path('images', 'gray.png')
    video1 = video.HTMLVideo(poster=poster)
    assert video1.get('full') == ''
    assert video1.get('thumb') == ''
    assert video1.get('src') == ''
