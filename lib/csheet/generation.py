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
from .database import Video, session_scope
from .exceptions import WorkerIdle
from .filename import filter_filename
from .workertools import (Locked, database_single_instance, work_forever,
                          worker_concurrency)

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


def execute_generate_task(**kwargs):
    """Generate from source to target.

    Args:
        source (str): Source column name(`poster` or `src`)
        target (str): Target column name(`thumb`, `poster` or `preview`)
        method (Video => path | None): Generation function.
        min_interval (int): Min generation interval.
        conditions (tuple[SQLAlchemy criterion]): Addtional filter criterion.

    Returns:
        bool: `True` if generated, `False` if nothing to generate.
    """

    with session_scope() as sess:
        source = kwargs.pop('source')
        target = kwargs.pop('target')
        method = kwargs.pop('method')

        video = _get_video(source, target, sess, **kwargs)
        if video is None:
            LOGGER.debug('No %s need generate.', target)
            return False
        assert isinstance(video, GenaratableVideo), type(video)

        video.touch(target)
        setattr(video, '{}_mtime'.format(target), None)

        video.try_apply(method, source, target)

    return True


def _get_video(source, target, session, **kwargs):

    video = session.query(
        GenaratableVideo
    ).filter(
        _need_generation_criterion(source, target, **kwargs)
    ).order_by(getattr(Video, '{}_atime'.format(target))).first()
    return video


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
                       (target_mtime_column != source_mtime_column)),
        *conditions
    )


GENERATION_TASKS = [
    {
        'source': 'poster',
        'target': 'thumb',
        'method': GenaratableVideo.generate_thumb,
        'min_interval': 1
    },
    {
        'source': 'src',
        'target': 'poster',
        'method': GenaratableVideo.generate_poster,
        'min_interval': 10,
        'conditions': (Video.poster.is_(None),)
    },
    {
        'source': 'src',
        'target': 'preview',
        'method': GenaratableVideo.generate_preview,
        'min_interval': 100
    },
]


def output_path(*other):
    """Get output path.  """

    path = os.path.join(APP.config['STORAGE'], *other)
    try:
        os.makedirs(os.path.dirname(path))
    except OSError:
        pass
    return path


def generate_forever():
    """Run as generate worker.  """

    work_forever(_do_generate, LOGGER, label='update')


def _do_generate():
    result = any(execute_generate_task(**i)
                 for i in GENERATION_TASKS)
    if not result:
        raise WorkerIdle


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError, Locked),
             retry_backoff=True)
def generate(video_id, source, target):
    """Celery Generate task.  """

    method = getattr(GenaratableVideo, 'generate_{}'.format(target))
    with session_scope() as sess:
        video = sess.query(GenaratableVideo).get(video_id)
        video.try_apply(method, source, target)


def discover_tasks(source, target, session, limit=100, **kwargs):
    """Discover generation tasks.  """

    kwargs['min_interval'] = max(
        kwargs.get('min_interval', 0),
        APP.config['DAEMON_TASK_EXPIRES'])
    method = getattr(GenaratableVideo, 'generate_{}'.format(target))
    lock = getattr(method, '_lock')

    if not lock.acquire(block=False):
        LOGGER.debug('During generation, skip discover: %s -> %s',
                     source, target)
        return
    lock.release()

    videos = session.query(GenaratableVideo).filter(
        _need_generation_criterion(source, target, **kwargs)).limit(limit).all()
    if not videos:
        LOGGER.debug('No generation task discovered: %s -> %s', source, target)
        return
    for i in videos:
        generate.apply_async(args=(i.uuid, source, target),
                             expires=APP.config['DAEMON_TASK_EXPIRES'])
    LOGGER.info('Discovered generation tasks: %s -> %s : count %s',
                source, target, len(videos))


@CELERY.task(ignore_result=True,
             autoretry_for=(sqlalchemy.exc.OperationalError,),
             retry_backoff=True)
@database_single_instance(name='generation.discover', is_block=False)
def discover_all_tasks():
    """Discover all generation tasks.  """

    with session_scope() as sess:
        discover_tasks('poster', 'thumb', sess, min_interval=1)
        discover_tasks('preview', 'poster', sess, min_interval=60,
                       conditions=(Video.poster.is_(None),),
                       limit=10)
        discover_tasks('src', 'preview', sess,
                       min_interval=120, limit=1)


@APP.before_first_request
def start():
    """Start generation thread.  """

    if APP.testing:
        spawn(generate_forever)


@CELERY.on_after_configure.connect
def setup_periodic_tasks(sender, **_):
    """Setup periodic tasks.  """

    sender.add_periodic_task(APP.config['GENERATION_DISCOVER_INTERVAL'],
                             discover_all_tasks,
                             expires=APP.config['GENERATION_DISCOVER_INTERVAL'])
