# -*- coding=UTF-8 -*-
"""HTML video thumbnail/preview generation.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import shutil
import tempfile
import time

import psutil
import six
import sqlalchemy
import sqlalchemy.exc
from gevent import spawn

from wlf import ffmpeg

from . import filecache, filepath
from .core import APP, CELERY, SOCKETIO
from .database import Session, Video, session_scope
from .encoder import normalize
from .exceptions import WorkerIdle
from .workertools import Locked, work_forever, worker_concurrency

LOGGER = logging.getLogger(__name__)


@six.python_2_unicode_compatible
class GenaratableVideo(Video):
    """Video that has method for generation.  """

    @property
    def methods(self):
        """Generation methods.

        Returns:
            dict: target field name as key,
                function as value.
        """

        return {'thumb': _generate_thumb,
                'poster': _generate_poster,
                'preview': _generate_preview, }

    def __str__(self):
        return '<GeneratableVideo, label={}, uuid={}>'.format(self.label, self.uuid)

    def generate(self, source, target):
        """Apply generate method on video.

        Args:
            source (str): Source field name.
            target (str): Target field name.

        Raises:
            ffmpeg.GenerateError: When generation failed.
        """
        sess = sqlalchemy.orm.object_session(self)
        method = self.methods[target]

        src = getattr(self, source)
        assert src, f'Source file path invalid, {self}'

        LOGGER.info('Generate %s for: %s', target, self)
        src = filepath.normalize(src)
        tmp = tempfile.mkdtemp('csheet-generation')
        try:
            dst = os.path.join(tmp, os.path.basename(src))
            result = method(src, dst)
            sess.add(self)  # XXX: May lose sess after generation
            mediainfo = ffmpeg.probe(result)
            if mediainfo.error:
                raise ffmpeg.GenerateError(mediainfo.error)
            result = filecache.save(result, is_move=True)
            setattr(self, target, result)
            setattr(self, '{}_mtime'.format(target),
                    getattr(self, '{}_mtime'.format(source)))
            setattr(self, '{}_atime'.format(target), time.time())
            LOGGER.info('Generation success: %s -> %s',
                        src, result)
            SOCKETIO.emit('asset update', normalize([self]))
        finally:
            shutil.rmtree(tmp)


def _interval():
    return APP.config['BROADCAST_INTERVAL']


@worker_concurrency(value=psutil.cpu_count(), timeout=_interval)
def _generate_thumb(src, dst):
    """Generate thumb.  """

    return ffmpeg.generate_jpg(src, dst, height=200)


@worker_concurrency(value=1, timeout=_interval)
def _generate_poster(src, dst):
    """Generate poster.  """

    return ffmpeg.generate_jpg(src, dst)


@worker_concurrency(value=1, timeout=_interval)
def _generate_preview(src, dst):
    """Generate preview.  """

    return ffmpeg.generate_mp4(src, dst, limit_size=APP.config['PREVIEW_SIZE_LIMIT'])


def output_path(*other):
    """Get output path.  """

    path = os.path.join(APP.config['STORAGE'], *other)
    assert path
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

    with session_scope() as sess:
        video: GenaratableVideo = sess.query(GenaratableVideo).get(video_id)
        now = time.time()
        if (video.generation_started
                and now - video.generation_started <= APP.config['MAX_TASK_TIME']):
            return
        video.generation_started = now
        sess.commit()
        try:
            video.generate(source, target)
            video.generation_started = None
        except (OSError, ffmpeg.GenerateError):
            sess.rollback()
            video.generation_started = None
            setattr(video, '{}_broken_mtime'.format(source),
                    getattr(video, '{}_mtime'.format(source)))
            sess.commit()
            raise
        except:
            sess.rollback()
            video.generation_started = None
            sess.commit()
            raise


@CELERY.on_after_configure.connect
def setup_periodic_tasks(sender, **_):
    """Setup periodic tasks.  """

    sender.add_periodic_task(_interval(),
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
    mtime_column = getattr(Video, '{}_mtime'.format(target))

    videos = (Session()
              .query(GenaratableVideo)
              .filter(_need_generation_criterion(source, target, **kwargs))
              .order_by(atime_column.isnot(None), atime_column, mtime_column)
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
        sqlalchemy.or_(Video.generation_started.is_(None),
                       time.time() - Video.generation_started
                       > APP.config['MAX_TASK_TIME']),
        source_column.isnot(None),
        source_mtime_column.isnot(None),
        sqlalchemy.or_(
            source_broken_mtime_column.is_(None),
            _timstamp_not_same(source_broken_mtime_column,
                               source_mtime_column)),
        sqlalchemy.or_(target_atime_column.is_(None),
                       target_atime_column < time.time() - min_interval),
        sqlalchemy.or_(target_column.is_(None),
                       target_mtime_column.is_(None),
                       _timstamp_not_same(target_mtime_column,
                                          source_mtime_column)),
        *conditions)


def _timstamp_not_same(column_a, column_b):
    return sqlalchemy.func.abs(column_a - column_b) > 1e-4


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
