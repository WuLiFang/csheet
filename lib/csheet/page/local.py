# -*- coding=UTF-8 -*-
"""Page config to render csheet page.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
from mimetypes import guess_type

import sqlalchemy

from wlf.path import PurePath
from wlf.path import get_encoded as e
from wlf.path import get_unicode as u

from ..filename import filter_filename
from ..filetools import uuid_from_path
from ..video import HTMLVideo
from .core import BasePage

LOGGER = logging.getLogger(__name__)


class LocalPage(BasePage):
    """Csheet page from a local folder.  """

    def __init__(self, root):
        self.root = u(root)

    def __repr__(self):
        return 'LocalPage<root={}>'.format(self.root)

    @property
    def title(self):
        return '{}色板'.format(self.root)

    @property
    def update_task(self):
        """Celery task to update page data.  """
        from .tasks import update_local_page
        return update_local_page.s(root=self.root)

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
        with session.no_autoflush:
            _ = [session.merge(i) for i in videos]
        session.commit()

    def videos(self, session):
        query = session.query(HTMLVideo)
        query = query.filter(
            self._video_criterion()
        ).order_by(HTMLVideo.label)
        return query.all()

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
