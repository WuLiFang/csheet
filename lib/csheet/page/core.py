# -*- coding=UTF-8 -*-
"""Page config to render csheet page.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import logging
import re
from abc import abstractmethod
from tempfile import TemporaryFile
from zipfile import ZipFile

from gevent import sleep
from jinja2 import Environment, FileSystemLoader, Undefined
from sqlalchemy import orm

from wlf.codectools import get_unicode as u
from wlf.path import PurePath
from wlf.path import get_encoded as e

from .. import __about__, database, filetools
from ..__about__ import __version__
from ..filename import filter_filename
from ..video import HTMLVideo

LOGGER = logging.getLogger(__name__)


def _read_assets():
    with open(filetools.dist_path('webpack-assets.json')) as f:
        return json.load(f)


class BasePage(object):
    """Base class for render csheet page. """

    templates_folder = filetools.dist_path('templates')
    version = __about__.__version__
    is_pack = False
    assets = _read_assets()

    @property
    def title(self):
        """Csheet title.  """

        raise NotImplementedError

    @property
    def update_task(self):
        """Celery task to update page data.  """

        raise NotImplementedError

    @abstractmethod
    def videos(self, session):
        """Videos for the csheet page.  """
        pass

    @abstractmethod
    def _video_criterion(self):
        pass

    @abstractmethod
    def update(self, session):
        """Update database with this config.  """
        pass

    def update_async(self):
        """Run sync in another thread.  """

        self.update_task.apply_async(countdown=3)

    def render(self, videos, template='csheet.html', database_session=None, **context):
        """Render the page.  """

        env = Environment(
            loader=FileSystemLoader(self.templates_folder),
        )
        template = env.get_template(template)

        return template.render(**self._template_context(context, videos, database_session))

    def _template_context(self, context, videos, database_session=None):
        context.setdefault('config', self)
        context.setdefault('videos', videos)
        context.setdefault('dumps', dumps)
        context.setdefault('dump', dump_videos)
        if database_session:
            context.setdefault('tags', self.tags(database_session))
        return context

    def archive(self, session):
        """Archive page and assets to a temporary file.  """

        LOGGER.info('Start archive page.')

        videos = self.videos(session)
        if not videos:
            raise ValueError('Empty page.')

        f = TemporaryFile(suffix='.zip',
                          prefix=self.title)
        with ZipFile(f, 'w', allowZip64=True) as zipfile:
            self._pack_page(videos, zipfile, session)
            self._pack_videos(videos, zipfile)

        f.seek(0)
        return f

    @classmethod
    def _pack_videos(cls, videos, zipfile):
        for video in videos:
            try:
                cls._pack_one_video(video, zipfile)
            except OSError:
                LOGGER.error('Error during pack', exc_info=True)
            sleep()

    @staticmethod
    def _pack_one_video(video, zipfile):
        assert isinstance(video, HTMLVideo)
        data = {'full': video.poster,
                'preview': video.preview,
                'thumb': video.thumb}
        for role, filename in data.items():
            if not filename:
                continue

            assert isinstance(filename, PurePath), type(filename)

            filename = filter_filename(filename)
            arcname = video.get(role, is_pack=True)
            zipfile.write(e(filename), arcname.encode('utf-8'))

            LOGGER.debug('Write zipfile: %s -> %s',
                         filename, arcname)

    def _pack_entry(self, zipfile, index_page, entry):
        entry_data = self.assets[entry]
        for i in entry_data.values():
            relative_path = i.lstrip('/')
            index_page = index_page.replace(i, relative_path)
            zipfile.write(filetools.dist_path(relative_path), i)
        return index_page

    def _pack_page(self, videos, zipfile, session):
        try:
            self.is_pack = True
            index_page = self.render(videos, database_session=session)
        finally:
            self.is_pack = False
        index_page = self._pack_entry(zipfile, index_page, 'chunk-vendors')
        index_page = self._pack_entry(zipfile, index_page, 'csheet')
        index_page = self._pack_entry(zipfile, index_page, 'csheet_noscript')
        zipfile.writestr(
            '{}.html'.format(get_valid_filename(self.title)),
            index_page.encode('utf-8'))

    def tags(self, session):
        """Page related tags.  """

        ret = session.query(database.Tag).options(
            orm.selectinload(database.Tag.videos)
        ).filter(
            database.Tag.videos.any(self._video_criterion())
        ).all()
        ret = tuple(i.serialize() for i in ret)
        return ret


def get_valid_filename(string):
    """Get valid filename.

    Args:
        string (str): Input string.

    Returns:
        str: Safe filename.
    """

    string = u(string).strip().replace(' ', '_')
    return re.sub(r'[^-\w.]', '%', string, flags=re.U)


def dumps(obj):
    """`json.dumps` for jinja template data.  """

    if isinstance(obj, Undefined):
        return ''
    return json.dumps(obj)


def dump_videos(videos):
    """Dump videos to string data.  """

    return json.dumps(database.Video.format_videos(videos))
