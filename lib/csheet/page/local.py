# -*- coding=UTF-8 -*-
"""Page config to render csheet page.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import base64
import logging
import os
from mimetypes import guess_type

import sqlalchemy

from wlf.path import PurePath
from wlf.path import get_encoded as e
from wlf.path import get_unicode as u

from . import core
from ..filename import filter_filename
from ..filetools import uuid_from_path
from ..video import HTMLVideo

LOGGER = logging.getLogger(__name__)


class LocalPage(core.BasePage):
    """Csheet page from a local folder.  """

    def __init__(self, root):
        self.root = u(root)

    def __repr__(self):
        return 'LocalPage<root={}>'.format(self.root)

    @classmethod
    def from_id(cls, id_, **kwargs):
        _, root = core.parse_id(id_)
        return cls(root)

    @property
    def id(self):
        id_ = core.ID_DETERMINER.join([self.__class__.__name__, self.root])
        return base64.b64encode(id_.encode('utf-8')).decode()

    @property
    def title(self):
        return '{}色板'.format(self.root)

    def update(self, session):
        """Scan root for videos.  """
        # Scan root.
        videos = {}
        images = {}
        for dirpath, _, filenames in os.walk(e(filter_filename(self.root))):
            for filename in filenames:
                fullpath = u(os.path.join(dirpath, filename))
                _sort_file(fullpath, images, videos)

        # Create videos.
        labels = sorted(set(list(videos.keys()) + list(images.keys())))
        LOGGER.info('Scan finished: '
                    '%s, image_count=%s, video_count=%s',
                    self, len(images), len(videos))
        videos = [_get_video(label, videos, images) for label in labels]
        self._video_query(session).with_for_update().merge_result(videos)
        session.commit()

    def videos(self, session):
        return self._video_query(session).all()

    def _video_query(self, session):
        return session.query(HTMLVideo).filter(
            self._video_criterion()
        ).order_by(HTMLVideo.label)

    def _video_criterion(self):
        root = filter_filename(self.root)
        return sqlalchemy.or_(
            HTMLVideo.src.startswith(root),
            HTMLVideo.poster.startswith(root)
        )


def _get_video(label, videos, images):
    src, poster = videos.get(label), images.get(label)
    return HTMLVideo(
        uuid=uuid_from_path(poster or src),
        src=src,
        poster=poster,
        label=label,
    )


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
        LOGGER.warning('Duplicated label, use bigger file: %s', value)
        if os.path.getsize(e(value)) <= os.path.getsize(e(dict_[label])):
            return
    dict_[label] = value
