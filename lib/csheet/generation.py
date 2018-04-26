# -*- coding=UTF-8 -*-
"""HTML video thumnail/preview generation.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import time
from contextlib import closing
from multiprocessing.dummy import Process

from sqlalchemy import or_

from wlf import ffmpeg

from . import setting
from .filename import filter_filename
from .model import Session, Video

LOGGER = logging.getLogger(__name__)


def generate_one_thumb():
    """Generate one not generated video"""

    session = Session()

    with closing(session):
        video = session.query(Video).filter(
            Video.poster.isnot(None),
            Video.poster_mtime.isnot(None),
            or_(Video.thumb_atime.is_(None),
                Video.thumb_atime < time.time() - 10),
            or_(Video.thumb.is_(None),
                Video.thumb_mtime.is_(None),
                (Video.thumb_mtime != Video.poster_mtime))
        ).first()
        if video is None:
            LOGGER.debug('No thumb need generate.')
            return False
        assert isinstance(video, Video), type(video)
        video.thumb_atime = time.time()
        session.commit()

        LOGGER.debug('Generate thumb for: %s', video)
        try:
            video.thumb = generate_thumb(video)
            video.thumb_mtime = video.poster_mtime
        except (OSError, ffmpeg.GenerateError):
            video.is_need_update = True

        session.commit()
    return True


def generate_one_preview():
    """Generate one not generated video"""

    session = Session()

    with closing(session):
        video = session.query(Video).filter(
            Video.src.isnot(None),
            Video.src_mtime.isnot(None),
            or_(Video.preview_atime.is_(None),
                Video.preview_atime < time.time() - 100),
            or_(Video.preview_mtime.is_(None),
                Video.preview.is_(None),
                (Video.preview_mtime != Video.src_mtime))
        ).first()
        if video is None:
            LOGGER.debug('No preview need generate.')
            return False
        assert isinstance(video, Video), type(video)
        video.preview_atime = time.time()
        session.commit()

        LOGGER.debug('Generate preview for: %s', video)
        try:
            video.preview = generate_preview(video)
            video.preview_mtime = video.src_mtime
        except (OSError, ffmpeg.GenerateError):
            video.is_need_update = True

        session.commit()
    return True


def output_path(*other):
    """Get output path.  """

    path = os.path.join(setting.STORAGE, *other)
    try:
        os.makedirs(os.path.dirname(path))
    except OSError:
        pass
    return path


def generate_thumb(video):
    """Generate thumb for video.  """

    assert isinstance(video, Video)
    if not video.poster:
        return None

    src = filter_filename(video.poster)
    output = output_path('thumb', video.uuid)
    assert output
    return ffmpeg.generate_jpg(
        src, output,
        height=200)


def generate_preview(video):
    """Generate preview for video.  """

    assert isinstance(video, Video)
    if not video.src:
        return None

    src = filter_filename(video.src)
    output = output_path('preview', video.uuid)
    assert output
    return ffmpeg.generate_mp4(
        src, output,
        limit_size=setting.PREVIEW_SIZE_LIMIT)


def generate_forever():
    """Run as generate worker.  """

    while True:
        try:
            if not (generate_one_thumb() or generate_one_preview()):
                time.sleep(1)
        except (KeyboardInterrupt, SystemExit):
            return
        except:  # pylint: disable=bare-except
            LOGGER.error(
                'Error during generation.', exc_info=True)


def start():
    """Start generation thread.  """

    process = Process(name='Generation', target=generate_forever)
    process.daemon = True
    process.start()
