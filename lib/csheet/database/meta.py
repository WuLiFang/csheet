# -*- coding=UTF-8 -*-
"""Application meta data.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from sqlalchemy import Column, String

from . import core


class Meta(core.BaseMeta):
    """Application meta data.  """

    __tablename__ = 'Meta'
    key = Column(String, primary_key=True)
    value = Column(core.JSONData)

    @classmethod
    def get(cls, key, default=None):
        """Get metadata value.  """

        with core.session_scope() as sess:
            item = sess.query(cls).get(key)
            if not item:
                return default
            return item.value

    @classmethod
    def set(cls, key, value):
        """Set metadata value.  """

        with core.session_scope() as sess:
            sess.merge(cls(key=key, value=value))
