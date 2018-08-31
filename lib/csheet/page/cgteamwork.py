# -*- coding=UTF-8 -*-
"""Page config to render csheet page.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import logging

import sqlalchemy.exc
from sqlalchemy import orm

import cgtwq
from wlf.decorators import run_with_clock

from ..database import CGTeamWorkTask
from ..database.cgteamworktask import TaskDataRow
from ..mimecheck import is_mimetype
from ..video import HTMLVideo
from .core import BasePage

LOGGER = logging.getLogger(__name__)


class CGTeamWorkPage(BasePage):
    """Csheet page from cgteamwork. """

    render_pipeline = {'灯光':  '渲染', '合成':  '输出'}
    module = 'shot'

    def __init__(self, project, pipeline, prefix, token):
        cgtwq.PROJECT.token = token
        entry = cgtwq.PROJECT.filter(cgtwq.Filter(
            'full_name', project)).to_entry()

        self.code, self.database = entry.get_fields('code', 'database')
        self.project = project
        self.pipeline = pipeline
        self.render_pipeline = self.render_pipeline.get(pipeline)
        self.prefix = prefix
        self.token = token

    def __repr__(self):
        return 'CGTeamWorkPage<project={}, pipeline={}, prefix={}>'.format(
            self.project, self.pipeline, self.prefix)

    @property
    def title(self):
        return '{}色板'.format(
            '_'.join(
                [self.project, self.prefix.strip(self.code).strip('_'), self.pipeline]))

    @property
    def update_task(self):
        """Celery task to update page data.  """

        from .tasks import update_cgteamwork_page
        return update_cgteamwork_page.s(project=self.project,
                                        pipeline=self.pipeline,
                                        prefix=self.prefix,
                                        token=self.token)

    def select(self):
        """Get cgteamwork database select from the config. """

        module = self._module()

        # Get shots.
        select = module.filter((cgtwq.Field('pipeline') == self.pipeline) &
                               cgtwq.Field('shot.shot').has(self.prefix))
        shots = sorted(
            set(i for i in select['shot.shot'] if i and i.startswith(self.prefix)))

        # Select from shots.
        select = module.filter(cgtwq.Field('shot.shot').in_(shots))
        return select

    def _module(self):
        database = cgtwq.Database(self.database)
        database.token = self.token
        return database.module(self.module)

    def _video_from_data(self, data, tasks, shot):
        data_current = _filter_data(
            data, shot=shot, pipeline=self.pipeline).next()
        try:
            data_render = _filter_data(
                data, shot=shot, pipeline=self.render_pipeline).next()
        except StopIteration:
            data_render = None

        uuid = data_current.id
        poster = (_get_poster(data_current) or
                  _get_poster(data_render))
        src = (_get_src(data_render) or
               _get_src(data_current))

        return HTMLVideo(
            uuid=uuid,
            task_id=uuid,
            src=src,
            poster=poster,
            label=shot,
            database=self.database,
            module=self.module,
            pipeline=self.pipeline,
            related_tasks=[i for i in tasks if i.shot == shot],)

    @run_with_clock('更新页面数据')
    def update(self, session):
        """Sync local database with cgteamwork database.  """

        select = self.select()
        data = select.get_fields(*TaskDataRow.fields)
        data = [TaskDataRow(*i) for i in data]

        shots = sorted(set(i.shot for i in data))
        LOGGER.info('Recived page data from cgteamwork server: '
                    '%s, shot_count=%s, task_count=%s',
                    self, len(shots), len(data))

        assert len(set([i.id for i in data])) == len(data)
        tasks = [self._task_from_data(i) for i in data]
        videos = [self._video_from_data(data, tasks, shot) for shot in shots]

        def _update():
            _ = [session.merge(i) for i in tasks + videos]
            session.commit()

        try:
            with session.no_autoflush:
                _update()
        except sqlalchemy.exc.IntegrityError:
            LOGGER.warning(
                'Commit page data failed, Retry with autoflush', exc_info=True)
            session.rollback()
            _update()

    def _task_from_data(self, data):
        assert isinstance(data, TaskDataRow), type(data)

        return CGTeamWorkTask(
            uuid=data.id,
            database=self.database,
            module=self.module,
            pipeline=data.pipeline,
            artist=data.artist,
            shot=data.shot,
            leader_status=data.leader_status,
            director_status=data.director_status,
            client_status=data.client_status,
            note_num=data.note_num,)

    @run_with_clock('收集视频信息')
    def videos(self, session):
        query = session.query(HTMLVideo)
        query = query.filter(
            HTMLVideo.database == self.database,
            HTMLVideo.pipeline == self.pipeline,
            HTMLVideo.label.startswith(self.prefix)
        ).options(
            orm.selectinload(HTMLVideo.related_tasks)
        ).options(
            orm.selectinload(HTMLVideo.tags)
        ).order_by(HTMLVideo.label)
        return query.all()

    @run_with_clock('收集任务信息')
    def tasks(self, session):
        """Video related task data.  """

        query = session.query(CGTeamWorkTask)
        query = query.filter(
            CGTeamWorkTask.database == self.database,
            CGTeamWorkTask.shot.startswith(self.prefix)
        ).order_by(CGTeamWorkTask.shot)
        data = query.all()

        return [i.to_task_info() for i in data]

    def _template_context(self, context, videos, database_session=None):
        context = super(CGTeamWorkPage, self)._template_context(
            context, videos, database_session)
        if database_session:
            context.setdefault('tasks', self.tasks(database_session))
        return context


def _get_submit_file(submit_file_data):
    if not submit_file_data:
        return
    try:
        data = json.loads(submit_file_data)
        filelist = data.get('file_path') or data.get('path')
        return filelist[0]
    except (TypeError, IndexError):
        LOGGER.warn('Parse submit file data fail: %s', repr(submit_file_data))
    return None


def _get_poster_from_image(image_data):
    if not image_data:
        return None
    dict_ = json.loads(image_data)
    assert isinstance(dict_, dict), repr(dict_)
    ret = dict_.get('path', dict_.get('image_path'))
    return ret


def _get_poster_from_submit(submit_file_data):
    ret = _get_submit_file(submit_file_data)
    if ret and is_mimetype(ret, 'image'):
        return ret
    return None


def _filter_data(data, **kwargs):

    return (i for i in data
            if all(i[i._fields.index(j)] == kwargs[j] for j in kwargs))


def _get_poster(data):
    if data is None:
        return None
    image_data = data[3]
    submit_file_data = data[4]
    return (_get_poster_from_image(image_data)
            or _get_poster_from_submit(submit_file_data))


def _get_src(data):
    if data is None:
        return None
    submit_file_data = data[4]

    ret = _get_submit_file(submit_file_data)
    if ret and is_mimetype(ret, 'video'):
        return ret
    return None
