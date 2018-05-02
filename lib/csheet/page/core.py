# -*- coding=UTF-8 -*-
"""Page config to render csheet page.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import logging
from abc import abstractmethod
from tempfile import TemporaryFile
from zipfile import ZipFile

from jinja2 import Environment, PackageLoader
from gevent import spawn
from wlf.path import get_encoded as e
from wlf.path import PurePath

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
    def videos(self):
        """Videos for the csheet page.  """
        pass

    @abstractmethod
    def update(self):
        """Update database with this config.  """
        pass

    def update_later(self):
        """Run sync in another thread.  """

        if self.videos():
            spawn(self.update)
        else:
            self.update()

    @property
    def title(self):
        """Csheet title.  """

        raise NotImplementedError

    def render(self, template='csheet.html', **context):
        """Render the page.  """

        env = Environment(
            loader=PackageLoader(__about__.__name__),
        )

        template = env.get_template(template)

        return template.render(config=self, dump=dump_videos, **context)

    def archive(self):
        """Archive page and assets to a temporary file.  """

        f = TemporaryFile(suffix='.zip',
                          prefix=self.title)
        LOGGER.info('Start archive page.')

        with ZipFile(f, 'w', allowZip64=True) as zipfile:

            # Pack images.
            videos = self.videos()
            if not videos:
                raise ValueError('Empty page.')

            for video in videos:
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
                    try:
                        zipfile.write(e(filename), arcname.encode('utf-8'))
                        LOGGER.debug('Write zipfile: %s -> %s',
                                     filename, arcname)
                    except OSError:
                        LOGGER.error('Error during pack', exc_info=True)

            # Pack static files:
            for i in self.static:
                zipfile.write(filetools.path(self.static_folder, i),
                              '{}/{}'.format(self.static_folder, i))

            # Pack index.
            try:
                self.is_pack = True
                index_page = self.render()
            finally:
                self.is_pack = False
            zipfile.writestr('{}.html'.format(self.title.replace('\\', '_')),
                             index_page.encode('utf-8'))
        f.seek(0)
        return f


def dump_videos(videos):
    """Dump videos to string data.  """

    ret = []
    for i in videos:
        assert isinstance(i, HTMLVideo)
        row = i.to_tuple()
        ret.append(row)
    return json.dumps(ret)
