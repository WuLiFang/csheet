# -*- coding=UTF-8 -*-
"""Test module `model`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import uuid
from contextlib import closing

from six import text_type

from csheet import model


def test_video_from_uuid():
    session = model.Session()
    with closing(session):
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


def test_video_from_poster():
    sess = model.Session()
    with closing(sess):
        sess.add(model.Video('src1', 'poster1'))
        sess.commit()

    video1 = model.Video(poster='poster1')
    assert text_type(video1.src) == 'src1'

    sess = model.Session()
    with closing(sess):
        sess.add(model.Video('scr2', 'poster2'))
        sess.commit()

    video2 = model.Video('src3', 'poster2')
    assert text_type(video2.src) == 'src3'
    video2 = model.Video('src2', 'poster2')
    assert text_type(video2.src) == 'src2'
