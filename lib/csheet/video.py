# -*- coding=UTF-8 -*-
"""HTML video used in csheet page.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from wlf.path import PurePath

from .filename import filter_filename
from .model import Video


class HTMLVideo(Video):
    """HTMLVideo object for render template.  """

    folder_names = {
        'thumb': 'thumbs',
        'preview': 'previews',
        'full': 'images'
    }
    file_suffix = {
        'thumb': '.jpg',
        'preview': '.mp4',
        'full': '.jpg'
    }

    def source(self, role):
        """Get generation source for role.  """

        if role in ('preview',):
            return self.src
        elif role in ('thumb', 'full'):
            return self.poster or self.src
        return None

    def get_drag(self, **config):
        """get path used on drag.  """

        path = PurePath(self.src or self.poster)
        if config.get('is_pack'):
            return '{}/{}'.format(
                self.folder_names['preview'] if self.src else self.folder_names['full'],
                path.name)

        if path.is_absolute():
            filename = filter_filename(path, 'win32').replace('\\', '/')
            return 'file://{}'.format(filename)

        return ''

    def get(self, role, **config):
        """Get url for given role.

        Args:
            role (str): role name, key of self.folder_names.
            **config (dict): jinja config env

        Returns:
            str: url  for role name.
        """

        if config.get('is_pack'):
            path = PurePath(self.src or self.poster)
            return '{}/{}'.format(
                self.folder_names[role],
                path.with_suffix(self.file_suffix[role]).name)

        timestamp_attr = {
            'thumb': 'thumb_mtime',
            'full': 'poster_mtime',
            'poster': 'poster_mtime',
            'src': 'src_mtime',
            'preview': 'preview_mtime'
        }[role]

        timestamp = getattr(self, timestamp_attr)
        if not timestamp:
            return ''

        url = '/videos/{}.{}?timestamp={}'.format(self.uuid, role, timestamp)
        return url
