# -*- coding=UTF-8 -*-
"""HTML video used in csheet page.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from .database import Video


class HTMLVideo(Video):
    """HTMLVideo object for render template.  """

    file_suffix = {
        'thumb': '.jpg',
        'preview': '.mp4',
        'poster': '.jpg'
    }

    def get(self, role, is_pack=False):
        """Get url for given role.

        Args:
            role (str): role name
            is_pack (bool): return pack version path.

        Returns:
            str: url  for role name.
        """

        suffix = self.file_suffix[role]
        basename = self.uuid
        if is_pack:
            basename = self.label or basename

        ret = f'video/{role}/{basename}{suffix}'

        if is_pack:
            return ret

        timestamp = getattr(self, f'{role}_mtime')
        if timestamp:
            ret += f'?timestamp={timestamp}'
        return ret
