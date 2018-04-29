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
        'full': 'images',
        'poster': 'images'
    }
    file_suffix = {
        'thumb': '.jpg',
        'preview': '.mp4',
        'full': '.jpg',
        'poster': '.jpg'
    }

    def source(self, role):
        """Get generation source for role.  """

        if role in ('preview',):
            return self.src
        elif role in ('thumb', 'full', 'poster'):
            return self.poster or self.src
        return None

    def get_drag(self, is_pack=False):
        """get path used on drag.  """

        path = self.src or self.poster
        if path:
            path = PurePath(path)
            if is_pack:
                return '{}/{}'.format(
                    self.folder_names['preview'] if self.src else self.folder_names['full'],
                    path.name)

            filename = filter_filename(path, 'win32').replace('\\', '/')
            return 'file://{}'.format(filename)

        return ''

    def get(self, role, is_pack=False):
        """Get url for given role.

        Args:
            role (str): role name, key of self.folder_names.
            is_pack (bool): return pack version path.

        Returns:
            str: url  for role name.
        """

        if is_pack:
            return '{}/{}{}'.format(
                self.folder_names[role],
                self.label or self.uuid,
                self.file_suffix[role])

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
