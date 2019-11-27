# -*- coding=UTF-8 -*-
"""Test module `video`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os
from datetime import datetime

from tests import util

from csheet import video


def test_get_path():
    poster = util.path('images', 'gray.png')
    video1 = video.HTMLVideo(poster=poster)
    assert video1.get('thumb')
    assert video1.get('poster')
    assert video1.get('preview')


def test_get_files():
    poster = util.path('images', 'gray.png')
    video1 = video.HTMLVideo(poster=poster, src='/some/not/exist/file')
    assert sorted(video1.get_files()) == sorted(
        [poster, '/some/not/exist/file'])
