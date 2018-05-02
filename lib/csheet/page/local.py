# -*- coding=UTF-8 -*-
"""Page config to render csheet page.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
from contextlib import closing
from mimetypes import guess_type

from wlf.path import PurePath
from ..localdatabase import uuid_from_path
from .. import model
from ..filename import filter_filename
from ..video import HTMLVideo
from .core import BasePage

LOGGER = logging.getLogger(__name__)


class LocalPage(BasePage):
    """Csheet page from a local folder.  """

    def __init__(self, root):
        self.root = root

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
        sess = model.Session()
        with closing(sess):
            for label in labels:
                src, poster = videos.get(label), images.get(label)
                uuid = uuid_from_path(poster or src)
                video = sess.query(HTMLVideo).get(uuid) or HTMLVideo(uuid=uuid)
                video.src = src
                video.poster = poster
                video.label = label
                sess.add(video)

            sess.commit()

    def videos(self):
        root = filter_filename(self.root)
        sess = model.Session()
        with closing(sess):
            query = sess.query(HTMLVideo)
            query = query.filter(
                HTMLVideo.src.startswith(root) |
                HTMLVideo.poster.startswith(root)
            ).order_by(HTMLVideo.label)
            return query.all()

    @property
    def title(self):
        return '{}色板'.format(self.root)
