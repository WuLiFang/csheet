# -*- coding=UTF-8 -*-
"""Page config to render csheet page.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import logging
from abc import abstractmethod
from tempfile import TemporaryFile
from zipfile import ZipFile

from gevent import spawn
from jinja2 import Environment, PackageLoader

from wlf.path import get_encoded as e
from wlf.path import PurePath
from .. import model

from .. import __about__, filetools
from ..__about__ import __version__
from ..filename import filter_filename
from ..video import HTMLVideo

LOGGER = logging.getLogger(__name__)


class BasePage(object):
    """Base class for render csheet page. """

    static = ('dist/csheet.css',
              'dist/csheet.bundle.js')
    static_folder = 'static'
    version = __about__.__version__
    is_pack = False

    @abstractmethod
    def videos(self, session):
        """Videos for the csheet page.  """
        pass

    @abstractmethod
    def update(self, session):
        """Update database with this config.  """
        pass

    def update_later(self, session):
        """Run sync in another thread.  """

        if self.videos(session):
            spawn(lambda: self.update(model.Session))
        else:
            self.update(session)

    @property
    def title(self):
        """Csheet title.  """

        raise NotImplementedError

    def render(self, videos, template='csheet.html', **context):
        """Render the page.  """

        env = Environment(
            loader=PackageLoader(__about__.__name__),
        )

        template = env.get_template(template)

        return template.render(config=self,
                               videos=videos,
                               dump=dump_videos, **context)

    def archive(self, session):
        """Archive page and assets to a temporary file.  """

        LOGGER.info('Start archive page.')

        videos = self.videos(session)
        if not videos:
            raise ValueError('Empty page.')

        f = TemporaryFile(suffix='.zip',
                          prefix=self.title)
        with ZipFile(f, 'w', allowZip64=True) as zipfile:
            self._pack_static(zipfile)
            self._pack_videos(videos, zipfile)
            self._pack_page(videos, zipfile)

        f.seek(0)
        return f

    @classmethod
    def _pack_videos(cls, videos, zipfile):
        for video in videos:
            try:
                cls._pack_one_video(video, zipfile)
            except OSError:
                LOGGER.error('Error during pack', exc_info=True)

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

    def _pack_static(self, zipfile):
        for i in self.static:
            zipfile.write(filetools.path(self.static_folder, i),
                          '{}/{}'.format(self.static_folder, i))

    def _pack_page(self, videos, zipfile):
        try:
            self.is_pack = True
            index_page = self.render(videos)
        finally:
            self.is_pack = False
        zipfile.writestr('{}.html'.format(self.title.replace('\\', '_')),
                         index_page.encode('utf-8'))


def dump_videos(videos):
    """Dump videos to string data.  """

    ret = []
    for i in videos:
        assert isinstance(i, HTMLVideo)
        row = i.to_tuple()
        ret.append(row)

    return json.dumps(ret)
