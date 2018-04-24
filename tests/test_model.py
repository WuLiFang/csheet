# -*- coding=UTF-8 -*-
"""Test module `model`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import uuid

from six import text_type

from csheet import model


def test_video():
    session = model.Session()
    src = uuid.uuid4().hex
    video1 = model.Video(src)
    session.add(video1)
    session.commit()

    video2 = model.Video(uuid=video1.uuid)
    assert text_type(video2.src) == src
    assert video2.poster is None
    video2.poster = 'test2'
    session.merge(video2)
    session.commit()

    video3 = model.Video(uuid=video1.uuid)
    assert text_type(video3.poster) == 'test2'
