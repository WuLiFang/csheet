# -*- coding=UTF_8 -*-
"""Compare mimetypes.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import mimetypes

from six import text_type


def same_mimetype(suffix_a, suffix_b):
    """Check if two suffix is same mimetype.

    Args:
        suffix_a (str): Suffix.
        suffix_b (str): Suffix.

    Returns:
        bool: Compare result.
    """

    map_ = mimetypes.types_map
    type_a, type_b = map_.get(suffix_a), map_.get(suffix_b)
    return type_a and type_a == type_b


def is_mimetype(filename, type_):
    """Check mimetype through filename.

    Args:
        filename (str): Filename.
        type_ (str, tuple): Types to check.

    Returns:
        bool: Test result.
    """

    filename = text_type(filename)
    mime, _ = mimetypes.guess_type(filename)
    return mime and mime.startswith(type_)
