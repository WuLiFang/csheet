# -*- coding=UTF-8 -*-
"""HTML video thumnail/preview generation.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import time

import psutil
import six
import sqlalchemy
import sqlalchemy.exc
from gevent import spawn

from wlf import ffmpeg

from .core import APP, CELERY
from .database import Session, Video, session_scope
from .exceptions import WorkerIdle
from .filename import filter_filename
from .workertools import Locked, work_forever, worker_concurrency

LOGGER = logging.getLogger(__name__)


@six.python_2_unicode_compatible
class GenaratableVideo(Video):
    """Video that has method for generation.  """

    def __str__(self):
        return '<GeneratableVideo, label={}, uuid={}>'.format(self.label, self.uuid)

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
            setattr(self, '{}_broken_mtime'.format(source),
                    getattr(self, '{}_mtime'.format(source)))
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
        LOGGER.info('Generation success: %s -> %s',
                    getattr(self, source), generated)

    def touch(self, target):
        """Set access time on target role.

        Args:
            target (str): Target role name.
        """

        setattr(self, '{}_atime'.format(target), time.time())

    @worker_concurrency(value=psutil.cpu_count(), is_block=True, timeout=5)
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

    @worker_concurrency(value=1, is_block=True, timeout=20)
    def generate_poster(self):
        """Generate thumb for video.  """

        if not self.src:
            return None

        src = filter_filename(self.src)
        output = output_path('poster', self.uuid)
        assert output
        return ffmpeg.generate_jpg(
            src, output)

    @worker_concurrency(value=1, is_block=False)
    def generate_preview(self):
        """Generate preview for video.  """

        if not self.src:
            return None

        src = filter_filename(self.src)
        output = output_path('preview', self.uuid)
        assert output
        return ffmpeg.generate_mp4(
            src, output,
            limit_size=APP.config['PREVIEW_SIZE_LIMIT'])


def output_path(*other):
    """Get output path.  """

    path = os.path.join(APP.config['STORAGE'], *other)
    try:
        os.makedirs(os.path.dirname(path))
    except OSError:
        pass
    return path


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError, Locked),
             retry_backoff=True)
def generate(video_id, source, target):
    """Celery Generate task.  """

    method = getattr(GenaratableVideo, 'generate_{}'.format(target))
    with session_scope() as sess:
        video = sess.query(GenaratableVideo).get(video_id)
        video.try_apply(method, source, target)


@CELERY.on_after_configure.connect
def setup_periodic_tasks(sender, **_):
    """Setup periodic tasks.  """

    sender.add_periodic_task(APP.config['GENERATION_DISCOVER_SCHEDULE'],
                             discover_tasks,
                             expires=5)


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError,),
             retry_backoff=True)
def discover_tasks():
    """Discover generation tasks.  """

    _discover_tasks('poster', 'thumb', min_interval=1)
    _discover_tasks('src', 'poster', min_interval=60,
                    conditions=(Video.poster.is_(None),),
                    limit=10)
    _discover_tasks('src', 'preview', min_interval=120, limit=1)


def _discover_tasks(source, target, limit=100, **kwargs):
    kwargs['min_interval'] = max(
        kwargs.get('min_interval', 0),
        APP.config['DAEMON_TASK_EXPIRES'])
    atime_column = getattr(Video, '{}_atime'.format(target))

    videos = (Session()
              .query(GenaratableVideo)
              .with_for_update(skip_locked=True)
              .filter(_need_generation_criterion(source, target, **kwargs))
              .order_by(atime_column.isnot(None), atime_column)
              .limit(limit)
              .all())
    if not videos:
        LOGGER.debug('No generation task discovered: %s -> %s', source, target)
        return False
    for i in videos:
        generate.apply_async(args=(i.uuid, source, target),
                             expires=APP.config['DAEMON_TASK_EXPIRES'])
    LOGGER.info('Discovered generation tasks: %s -> %s : count %s',
                source, target, len(videos))
    return True


def _need_generation_criterion(source, target, **kwargs):
    min_interval = kwargs.pop('min_interval', 0)
    conditions = kwargs.pop('conditions', ())

    source_column = getattr(Video, source)
    source_mtime_column = getattr(Video, '{}_mtime'.format(source))
    source_broken_mtime_column = getattr(
        Video, '{}_broken_mtime'.format(source))
    target_column = getattr(Video, target)
    target_mtime_column = getattr(Video, '{}_mtime'.format(target))
    target_atime_column = getattr(Video, '{}_atime'.format(target))

    return sqlalchemy.and_(
        source_column.isnot(None),
        source_mtime_column.isnot(None),
        sqlalchemy.or_(source_broken_mtime_column.is_(None),
                       source_broken_mtime_column != source_mtime_column),
        sqlalchemy.or_(target_atime_column.is_(None),
                       target_atime_column < time.time() - min_interval),
        sqlalchemy.or_(target_column.is_(None),
                       target_mtime_column.is_(None),
                       (sqlalchemy.func.abs(target_mtime_column - source_mtime_column)) > 1e-4),
        *conditions
    )


@APP.before_first_request
def start():
    """Start generation thread.  """

    if APP.config['STANDALONE']:
        spawn(generate_forever)


def generate_forever():
    """Run as generate worker.  """

    work_forever(_do_generate, LOGGER, label='update')


def _do_generate():
    result = any(_discover_tasks(limit=1, **i)
                 for i in GENERATION_TASKS)
    if not result:
        raise WorkerIdle


GENERATION_TASKS = [
    {
        'source': 'poster',
        'target': 'thumb',
        'min_interval': 1
    },
    {
        'source': 'src',
        'target': 'poster',
        'min_interval': 10,
        'conditions': (Video.poster.is_(None),)
    },
    {
        'source': 'src',
        'target': 'preview',
        'min_interval': 100
    },
]
