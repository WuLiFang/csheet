# -*- coding=UTF-8 -*-
"""Page config to render csheet page.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import logging
from contextlib import closing

import cgtwq

from .. import model
from ..mimecheck import is_mimetype
from ..video import HTMLVideo
from .core import BasePage

LOGGER = logging.getLogger(__name__)


class CGTeamWorkPage(BasePage):
    """Csheet page from cgteamwork. """

    render_pipeline = {'灯光':  '渲染', '合成':  '输出'}

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
        return 'CGTeamWorKConfig<project={}, pipeline={}, prefix={}>'.format(
            self.project, self.pipeline, self.prefix)

    def select(self):
        """Get cgteamwork database select from the config. """

        database = cgtwq.Database(self.database)
        database.token = self.token
        module = database['shot_task']

        select = module.filter(cgtwq.Filter('pipeline', self.pipeline) &
                               cgtwq.Filter('shot.shot', self.prefix, 'has'))
        shots = sorted(
            set(i for i in select['shot.shot'] if i and i.startswith(self.prefix)))
        select = module.filter(cgtwq.Field('shot.shot') | shots)
        return select

    def update(self):
        """Sync local database with cgteamwork database.  """

        LOGGER.info('Sync with cgteamwork: %s', self)

        select = self.select()
        data = select.get_fields('id', 'pipeline', 'shot.shot',
                                 'image', 'submit_file_path')
        shots = sorted(set(i[2] for i in data))

        def _get_submit_file(submit_file_data):
            try:
                return json.loads(submit_file_data)['file_path'][0]
            except (TypeError, KeyError, IndexError):
                pass
            return None

        def _get_poster(data):
            if data is None:
                return None
            _, _, _, image_data, submit_file_data = data
            if image_data:
                dict_ = json.loads(image_data)
                assert isinstance(dict_, dict), repr(dict_)
                ret = dict_.get('path', dict_.get('image_path'))
                if ret:
                    return ret
            if submit_file_data:
                ret = _get_submit_file(submit_file_data)
                if ret and is_mimetype(ret, 'image'):
                    return ret

            return None

        def _get_src(data):
            if data is None:
                return None
            _, _, _, _, submit_file_data = data

            ret = _get_submit_file(submit_file_data)
            if ret and is_mimetype(ret, 'video'):
                return ret
            return None

        videos = []
        for shot in shots:
            data_current = (
                i for i in data if i[2] == shot and i[1] == self.pipeline).next()
            try:
                data_render = (
                    i for i in data if i[2] == shot and i[1] == self.render_pipeline).next()
            except StopIteration:
                data_render = None

            video = HTMLVideo(
                src=_get_src(data_render) or _get_src(data_current),
                poster=_get_poster(data_current) or _get_poster(data_render),
                uuid=data_current[0])

            video.label = shot
            video.database = self.database
            video.pipeline = self.pipeline
            video.task_info = {'task_id': [i[0] for i in data if i[2] == shot]}

            videos.append(video)

        sess = model.Session()
        with closing(sess):
            sess.add_all(videos)
            sess.commit()
            return videos

    def videos(self):

        sess = model.Session()
        with closing(sess):
            query = sess.query(HTMLVideo)
            query = query.filter(
                HTMLVideo.database == self.database,
                HTMLVideo.pipeline == self.pipeline,
                HTMLVideo.label.startswith(self.prefix))
            return query.all()

    @property
    def title(self):
        return '{}色板'.format(
            '_'.join(
                [self.project, self.prefix.strip(self.code).strip('_'), self.pipeline]))
