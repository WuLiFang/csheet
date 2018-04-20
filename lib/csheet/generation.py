# -*- coding=UTF-8 -*-
"""HTML video thumnail/preview generation.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from sqlalchemy.exc import SQLAlchemyError

from wlf import ffmpeg

from . import setting
from .model import Session, Video


def generate_one():
    """Generate one not generated video"""

    session = Session()

    try:
        video = session.query(Video).filter(
            Video.is_generated.is_(False)).first()
        assert isinstance(video, Video)
    except SQLAlchemyError:
        return

    video.thumb = get_thumb(video)
    video.preview = get_preview(video)
    video.is_generated = True
    session.commit()


def get_thumb(video):
    """Generate thumb for video.  """

    assert isinstance(video, Video)
    if not video.poster:
        return None
    return ffmpeg.generate_jpg(
        video.poster, setting.STORAGE,
        height=200)


def get_preview(video):
    """Generate preview for video.  """

    assert isinstance(video, Video)
    if not video.src:
        return None
    return ffmpeg.generate_mp4(
        video.src, setting.STORAGE,
        limit_size=setting.PREVIEW_SIZE_LIMIT)


def generate_forever():
    """Run as generate worker.  """

    while True:
        generate_one()
