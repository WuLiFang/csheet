# -*- coding=UTF-8 -*-
"""Use filter to convert filename between diffrent filesystem.  """

import os
import re
import sys
import string

from wlf.path import get_unicode as u


def filter_filename(path, platform=None):
    """Filter path for unix/windows path convertion.

    Args:
        path (str): Path to replace.
        platform(str): Platform in `sys.platform` manner.
    Returns:
        str: Converted path.
    """

    path = u(path)

    try:
        filters = get_filename_filters(platform)
    except ValueError:
        return path

    for i in filters.split(','):
        src, _, dst = i.rpartition(':')
        pattern = re.sub(r'[/\\]', r'[\\\\/]', src)
        pattern = '^{}'.format(pattern)
        path = re.sub(pattern, dst, path, 1, re.I)

    if platform == sys.platform:
        path = os.path.normpath(path)
    elif platform != 'win32':
        path = path.replace('\\', '/')
    return path


def get_filename_filters(platform=None):
    """Get filename filter from environment.
        or use default if environment not set.
        platform (text_type, optional): Defaults to None.
            Target platform.

    Returns:
        text_type: Filters.
    """

    filters = u(os.getenv('FILENAME_FILTER', ''))
    if not filters:
        if (platform or sys.platform) == 'win32':
            drive_letter_conv = [
                '/{}/:{}:/'.format(i.lower(), i) for i in string.uppercase]
        else:
            drive_letter_conv = [
                '{}:/:/{}/'.format(i, i.lower()) for i in string.uppercase]
        filters = ','.join(drive_letter_conv)
    filters += ','
    return filters
