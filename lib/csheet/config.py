# -*- coding=UTF-8 -*-
"""Page config to render csheet page.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import logging
import os
from abc import abstractmethod
from contextlib import closing
from mimetypes import guess_type

import cgtwq

from wlf.decorators import run_async
from wlf.path import PurePath

from . import model
from .__about__ import __version__
from .filename import filter_filename
from .mimecheck import is_mimetype
from .video import HTMLVideo

LOGGER = logging.getLogger(__name__)


class BaseConfig(object):
    """Base config class for render csheet page. """

    static = ('dist/csheet.css',
              'dist/csheet.bundle.js')
    static_folder = 'static'
    version = __version__
    is_client = True
    is_pack = False

    @abstractmethod
    def videos(self):
        """Videos for the csheet page.  """
        pass

    @property
    def title(self):
        """Csheet title.  """

        raise NotImplementedError


class CGTeamWorkConfig(BaseConfig):
    """For render csheet page from cgteamwork. """
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

    @run_async
    def sync_with_thread(self):
        """Run sync in another thread.  """

        return self.sync()

    def sync(self):
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

            video = HTMLVideo(uuid=data_current[0])

            video.label = shot
            video.src = _get_src(data_render) or _get_src(data_current)
            video.poster = _get_poster(
                data_current) or _get_poster(data_render)
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


class LocalConfig(BaseConfig):
    """Config for csheet from local folder.  """

    def __init__(self, root):
        self.root = root
        self.uuid_list = []

    def update(self):
        """Scan root for videos.  """
        # Scan root.
        videos = {}
        images = {}
        for dirpath, _, filenames in os.walk(filter_filename(self.root)):
            for filename in filenames:
                fullpath = os.path.join(dirpath, filename)
                label = PurePath(filename).stem
                type_, _ = guess_type(filename)
                if type_ is None:
                    LOGGER.warning('File type unknown: %s', fullpath)
                elif type_.startswith('image/'):
                    if label not in images:
                        images[label] = fullpath
                    else:
                        LOGGER.warning('Duplicated image label: %s', fullpath)
                elif type_.startswith('video/'):
                    if label not in videos:
                        videos[label] = fullpath
                    else:
                        LOGGER.warning('Duplicated video label: %s', fullpath)

        # Create videos.
        labels = sorted(set(videos.keys() + images.keys()))
        LOGGER.debug('Labels: %s', labels)
        ret = []
        for label in labels:
            video = HTMLVideo(src=videos.get(label),
                              poster=images.get(label))
            video.label = label
            ret.append(video)

        # Save to database.
        sess = model.Session()
        with closing(sess):
            sess.add_all(ret)
            sess.commit()
            self.uuid_list = [i.uuid for i in ret]

    def videos(self):

        sess = model.Session()
        with closing(sess):
            query = sess.query(HTMLVideo)
            query = query.filter(HTMLVideo.uuid.in_(
                self.uuid_list)).order_by(HTMLVideo.label)
            return query.all()

    @property
    def title(self):
        return '{}色板'.format(self.root)
