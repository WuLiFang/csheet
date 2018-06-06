# -*- coding=UTF-8 -*-
"""Page config to render csheet page.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os

from mimetypes import guess_type

from wlf.path import PurePath, get_unicode as u

from ..filename import filter_filename
from ..filetools import uuid_from_path
from ..video import HTMLVideo
from .core import BasePage

LOGGER = logging.getLogger(__name__)


class LocalPage(BasePage):
    """Csheet page from a local folder.  """

    def __init__(self, root):
        self.root = u(root)

    def update(self, session):
        """Scan root for videos.  """
        # Scan root.
        videos = {}
        images = {}
        for dirpath, _, filenames in os.walk(filter_filename(self.root)):
            for filename in filenames:
                fullpath = os.path.join(dirpath, filename)
                _sort_file(fullpath, images, videos)

        # Create videos.
        labels = sorted(set(videos.keys() + images.keys()))
        for label in labels:
            self._create_video(label, videos, images, session)

        session.commit()

    @staticmethod
    def _create_video(label, videos, images, session):
        src, poster = videos.get(label), images.get(label)
        uuid = uuid_from_path(poster or src)
        video = session.query(HTMLVideo).get(uuid) or HTMLVideo(uuid=uuid)
        video.src = src
        video.poster = poster
        video.label = label
        session.add(video)

    def videos(self, session):
        root = filter_filename(self.root)
        query = session.query(HTMLVideo)
        query = query.filter(
            HTMLVideo.src.startswith(root) |
            HTMLVideo.poster.startswith(root)
        ).order_by(HTMLVideo.label)
        return query.all()

    @property
    def title(self):
        return '{}色板'.format(self.root)


def _sort_file(path, images, videos):
    label = PurePath(path).stem
    type_, _ = guess_type(path)
    if type_ is None:
        LOGGER.warning('File type unknown: %s', path)
    elif type_.startswith('image/'):
        _set_label_dict(images, label, path)
    elif type_.startswith('video/'):
        _set_label_dict(videos, label, path)


def _set_label_dict(dict_, label, value):
    if label in dict_:
        LOGGER.warning('Duplicated label: %s', value)
    else:
        dict_[label] = value
