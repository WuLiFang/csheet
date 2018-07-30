# -*- coding=UTF-8 -*-
"""Application meta data.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from sqlalchemy import Column, String

from . import core


class Meta(core.Base):
    """Application meta data.  """

    __tablename__ = 'Meta'
    key = Column(String, primary_key=True)
    value = Column(core.JSONData)

    @classmethod
    def get(cls, key, session, default=None):
        """Get metadata value.  """

        item = session.query(cls).get(key)
        if not item:
            return default
        return item.value

    @classmethod
    def set(cls, key, value, session):
        """Set metadata value.  """

        item = session.query(cls).get(key)
        if not item:
            item = cls(key=key)
            session.add(item)
        item.value = value
        session.commit()
