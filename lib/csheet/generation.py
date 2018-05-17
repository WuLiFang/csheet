# -*- coding=UTF-8 -*-
"""HTML video thumnail/preview generation.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import time

from gevent import sleep, spawn
from sqlalchemy import or_

from wlf import ffmpeg

from . import setting
from .filename import filter_filename
from .model import Video, session_scope
from .workertools import try_execute

LOGGER = logging.getLogger(__name__)


class GenaratableVideo(Video):
    """Video that has method for generation.  """

    def try_apply(self, method, source, target):
        """Apply generate method with generation errors handled.

        Args:
            method ((GeneratableVideo) => None | PurePath): Generation method.
            target (str): Target role name.
            source (str): Source role name.
        """

        try:
            self.apply(method, target, source)
        except (OSError, ffmpeg.GenerateError):
            self.is_need_update = True
            LOGGER.warning('Generation failed', exc_info=True)

    def apply(self, method, target, source):
        """Apply generate method on video.

        Args:
            method ((GeneratableVideo) => None | PurePath): Generation method.
            target (str): Target role name.
            source (str): Source role name.

        Raises:
            ffmpeg.GenerateError: When generation failed.
        """

        LOGGER.info('Generate %s for: %s', target, self)

        generated = method(self)
        mediainfo = ffmpeg.probe(generated)
        if mediainfo.error:
            raise ffmpeg.GenerateError(mediainfo.error)
        setattr(self, target, generated)
        setattr(self, '{}_mtime'.format(target),
                getattr(self, '{}_mtime'.format(source)))
        self.touch(target)

    def touch(self, target):
        """Set access time on target role.

        Args:
            target (str): Target role name.
        """

        setattr(self, '{}_atime'.format(target), time.time())

    def generate_thumb(self):
        """Generate thumb for video.  """

        if not self.poster:
            return None

        src = filter_filename(self.poster)
        output = output_path('thumb', self.uuid)
        assert output
        return ffmpeg.generate_jpg(
            src, output,
            height=200)

    def generate_poster(self):
        """Generate thumb for video.  """

        if not self.src:
            return None

        src = filter_filename(self.src)
        output = output_path('poster', self.uuid)
        assert output
        return ffmpeg.generate_jpg(
            src, output)

    def generate_preview(self):
        """Generate preview for video.  """

        if not self.src:
            return None

        src = filter_filename(self.src)
        output = output_path('preview', self.uuid)
        assert output
        return ffmpeg.generate_mp4(
            src, output,
            limit_size=setting.PREVIEW_SIZE_LIMIT)


def abstract_generation(session, **kwargs):
    """Abstact generation from source to target.

    Args:
        source (str): Source column name(`poster` or `src`)
        target (str): Target column name(`thumb`, `poster` or `preview`)
        method (Video => path | None): Generation function.
        min_interval (int): Min generation interval.
        conditions (tuple[SQLAlchemy criterion]): Addtional filter criterion.

    Returns:
        bool: `True` if generated, `False` if nothing to generate.
    """

    source = kwargs.pop('source')
    target = kwargs.pop('target')
    method = kwargs.pop('method')

    video = _get_video(source, target, session, **kwargs)
    if video is None:
        LOGGER.debug('No %s need generate.', target)
        return False
    assert isinstance(video, GenaratableVideo), type(video)

    video.touch(target)
    setattr(video, '{}_mtime'.format(target), None)
    session.commit()
    session.refresh(video)
    video.try_apply(method, source, target)
    session.commit()

    return True


def _get_video(source, target, session, **kwargs):
    min_interval = kwargs.pop('min_interval', 0)
    conditions = kwargs.pop('conditions', ())

    source_column = getattr(Video, source)
    source_mtime_column = getattr(Video, '{}_mtime'.format(source))
    target_column = getattr(Video, target)
    target_mtime_column = getattr(Video, '{}_mtime'.format(target))
    target_atime_column = getattr(Video, '{}_atime'.format(target))

    video = session.query(GenaratableVideo).filter(
        source_column.isnot(None),
        source_mtime_column.isnot(None),
        or_(target_atime_column.is_(None),
            target_atime_column < time.time() - min_interval),
        or_(target_column.is_(None),
            target_mtime_column.is_(None),
            (target_mtime_column != source_mtime_column)),
        *conditions
    ).order_by(target_atime_column).first()
    return video


def generate_one_thumb(session):
    """Generate one outdated thumb"""

    return abstract_generation(
        session=session,
        source='poster',
        target='thumb',
        method=GenaratableVideo.generate_thumb,
        min_interval=1)


def generate_one_poster(session):
    """Generate one not generated poster"""

    return abstract_generation(
        session=session,
        source='src',
        target='poster',
        method=GenaratableVideo.generate_poster,
        min_interval=10,
        condition=(Video.poster.is_(None),))


def generate_one_preview(session):
    """Generate one outdated preview"""

    return abstract_generation(
        session=session,
        source='src',
        target='preview',
        method=GenaratableVideo.generate_preview,
        min_interval=100)


def output_path(*other):
    """Get output path.  """

    path = os.path.join(setting.STORAGE, *other)
    try:
        os.makedirs(os.path.dirname(path))
    except OSError:
        pass
    return path


def generate_forever():
    """Run as generate worker.  """

    while True:
        success = try_execute(_do_generate, LOGGER, 'generate')
        sleep(0 if success else 1)


def _do_generate():
    with session_scope() as sess:
        return (generate_one_thumb(sess)
                or generate_one_poster(sess)
                or generate_one_preview(sess))


def start():
    """Start generation thread.  """

    spawn(generate_forever)
