# -*- coding=UTF-8 -*-
"""HTML video thumnail/preview generation.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import time
from contextlib import closing

from multiprocessing.dummy import Process
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
            Video.poster.isnot(None)
            & Video.poster_mtime.isnot(None)
            & (Video.thumb_mtime.is_(None)
               | Video.thumb.is_(None)
               | (Video.thumb_mtime != Video.poster_mtime))
        ).first()
        if video is None:
            return False
        assert isinstance(video, Video), type(video)

        LOGGER.debug('Generate thumb for: %s', video)
        try:
            video.thumb = generate_thumb(video)
            video.thumb_mtime = video.poster_mtime
        except OSError:
            video.thumb_mtime = None
            video.poster_mtime = None
        except ffmpeg.GenerateError:
            video.poster = None
            video.poster_mtime = video.thumb_mtime

        session.commit()
    return True


def generate_one_preview():
    """Generate one not generated video"""

    session = Session()

    with closing(session):
        video = session.query(Video).filter(
            Video.src.isnot(None)
            & Video.src_mtime.isnot(None)
            & (Video.preview_mtime.is_(None)
               | Video.preview.is_(None)
               | (Video.preview_mtime != Video.src_mtime))
        ).first()
        if video is None:
            return False
        assert isinstance(video, Video), type(video)

        LOGGER.debug('Generate preview for: %s', video)
        try:
            video.preview = generate_preview(video)
            video.preview_mtime = video.src_mtime
        except OSError:
            video.preview_mtime = None
            video.src_mtime = None
        except ffmpeg.GenerateError:
            video.src = None
            video.preview_mtime = video.src_mtime

        session.commit()
    return True


def output_path(*other):
    """Get output path.  """

    if not setting.STORAGE:
        return None

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
