# -*- coding=UTF-8 -*-
"""Page config to render csheet page.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import base64
import json
import logging
import os
import re
from abc import abstractmethod
from tempfile import TemporaryFile
from zipfile import ZipFile

from flask import render_template
from gevent import sleep
from sqlalchemy import orm

from wlf.codectools import get_unicode as u
from wlf.path import PurePath

from .. import __about__, core, database, filetools
from ..__about__ import __version__
from ..filename import filter_filename
from ..video import HTMLVideo

LOGGER = logging.getLogger(__name__)
ID_DETERMINER = '\n'


def _read_assets():
    with open(filetools.dist_path('webpack-assets.json')) as f:
        return json.load(f)


PAGE_REGISTRY = {}


def parse_id(id_):
    """Parse id to parts.

    Args:
        id_ (str)
    Returns:
        list
    """
    return base64.b64decode(id_).decode().split(ID_DETERMINER)


def page_from_id(id_, **kwargs):
    """Get page from id.

    Args:
        id_ (str): Page id.

    Return:
        BasePage
    """

    type_ = parse_id(id_)[0]
    return PAGE_REGISTRY[type_].from_id(id_, **kwargs)


class BasePage(object):
    """Base class for render csheet page. """

    version = __about__.__version__
    is_pack = False
    assets = _read_assets()

    @classmethod
    def __init_subclass__(cls):
        PAGE_REGISTRY[cls.__name__] = cls

    @classmethod
    def from_id(cls, id_, **kwargs):
        """Get page from id.

        Args:
            id_ (str): Page id.

        Return:
            cls
        """
        raise NotImplementedError

    @property
    def id(self):
        """"Page global id.  """

        raise NotImplementedError

    @property
    def title(self):
        """Csheet title.  """

        raise NotImplementedError

    @property
    def update_task(self):
        """Celery task to update page data.  """

        from .tasks import update_base_page
        return update_base_page.s(id_=self.id)

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

    def render(self, template='main.html', database_session=None, **context):
        """Render the page.  """

        return render_template(template, **self._process_context(context, database_session))

    def _process_context(self, context, database_session=None):
        context.setdefault('config', self)
        if database_session:
            context.setdefault('videos', self.videos(database_session))
            context.setdefault('tags', self.tags(database_session))
        return context

    def data(self, database_session):
        """Page related data.  """

        return {
            'videos': self.videos(database_session),
            'tags': self.tags(database_session),
        }

    def archive(self, session):
        """Archive page and assets to a temporary file.  """

        LOGGER.info('Start archive page.')

        videos = self.videos(session)
        if not videos:
            raise ValueError('Empty page.')

        f = TemporaryFile(suffix='.zip',
                          prefix=self.title)
        with ZipFile(f, 'w', allowZip64=True) as zipfile:
            self._pack_page(zipfile, session)
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
        data = {'poster': video.poster,
                'preview': video.preview,
                'thumb': video.thumb}
        for role, filename in list(data.items()):
            if not filename:
                continue

            assert isinstance(filename, PurePath), type(filename)

            filename = filter_filename(filename)
            filename = os.path.join(core.APP.config['STORAGE'], filename)
            arcname = video.get(role, is_pack=True)
            zipfile.write(filename, arcname)

            LOGGER.debug('Write zipfile: %s -> %s',
                         filename, arcname)

    def _pack_static(self, zipfile: ZipFile, index_page: str):
        for dirpath, _, filenames in os.walk(filetools.dist_path('static')):
            for i in filenames:
                filename = os.path.join(dirpath, i)
                arcname = (PurePath(filename)
                           .relative_to(filetools.dist_path())
                           .as_posix())
                index_page = index_page.replace(f'/{arcname}', arcname)
                zipfile.write(filename, arcname)
        return index_page

    def _pack_page(self, zipfile, session):
        try:
            self.is_pack = True
            index_page = self.render(database_session=session)
        finally:
            self.is_pack = False
        index_page = self._pack_static(zipfile, index_page)
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
