# -*- coding=UTF-8 -*-
"""HTML video thumnail/preview generation.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import time
from contextlib import closing

from gevent import sleep, spawn
from sqlalchemy import or_

from wlf import ffmpeg

from . import setting
from .filename import filter_filename
from .model import Session, Video

LOGGER = logging.getLogger(__name__)


def abstract_generation(source, target, method, min_interval, condition=()):
    """Abstact generation from source to target.

    Args:
        source (str): Source column name(`poster` or `src`)
        target (str): Target column name(`thumb`, `poster` or `preview`)
        method (Video => path | None): Generation function.
        min_interval (int): Min generation interval

    Returns:
        bool: `True` if generated, `False` if nothing to generate.
    """

    source_column = getattr(Video, source)
    source_mtime_column = getattr(Video, '{}_mtime'.format(source))
    target_column = getattr(Video, target)
    target_mtime_column = getattr(Video, '{}_mtime'.format(target))
    target_atime_column = getattr(Video, '{}_atime'.format(target))

    session = Session()

    with closing(session):
        video = session.query(Video).filter(
            source_column.isnot(None),
            source_mtime_column.isnot(None),
            or_(target_atime_column.is_(None),
                target_atime_column < time.time() - min_interval),
            or_(target_column.is_(None),
                target_mtime_column.is_(None),
                (target_mtime_column != source_mtime_column)),
            *condition
        ).order_by(target_atime_column).first()
        if video is None:
            LOGGER.debug('No %s need generate.', target)
            return False
        assert isinstance(video, Video), type(video)

        def _touch():
            setattr(video, '{}_atime'.format(target), time.time())
        _touch()
        setattr(video, '{}_mtime'.format(target), None)
        session.commit()

    LOGGER.debug('Generate %s for: %s', target, video)
    try:
        generated = method(video)
        mediainfo = ffmpeg.probe(generated)
        if mediainfo.error:
            raise ffmpeg.GenerateError(mediainfo.error)
        setattr(video, target, generated)
        setattr(video, '{}_mtime'.format(target),
                getattr(video, '{}_mtime'.format(source)))
        _touch()
    except (OSError, ffmpeg.GenerateError):
        video.is_need_update = True
        LOGGER.warning('Generation failed', exc_info=True)

    session = Session()

    with closing(session):
        session.add(video)
        session.commit()
    return True


def generate_one_thumb():
    """Generate one outdated thumb"""

    return abstract_generation(
        source='poster',
        target='thumb',
        method=generate_thumb,
        min_interval=10)


def generate_one_poster():
    """Generate one not generated poster"""

    return abstract_generation(
        source='src',
        target='poster',
        method=generate_poster,
        min_interval=10,
        condition=(Video.poster.is_(None),))


def generate_one_preview():
    """Generate one outdated preview"""

    return abstract_generation(
        source='src',
        target='preview',
        method=generate_preview,
        min_interval=100)


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


def generate_poster(video):
    """Generate thumb for video.  """

    assert isinstance(video, Video)
    if not video.src:
        return None

    LOGGER.debug('generate_poster, %s', video)
    src = filter_filename(video.src)
    output = output_path('poster', video.uuid)
    assert output
    return ffmpeg.generate_jpg(
        src, output)


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
            sleep(0 if (generate_one_thumb()
                        or generate_one_poster()
                        or generate_one_preview()) else 1)
        except (KeyboardInterrupt, SystemExit):
            return
        except:  # pylint: disable=bare-except
            LOGGER.error(
                'Error during generation.', exc_info=True)


def start():
    """Start generation thread.  """

    spawn(generate_forever)
