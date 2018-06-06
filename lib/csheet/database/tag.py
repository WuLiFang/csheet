# -*- coding=UTF-8 -*-
"""Data models.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from sqlalchemy import Column, String, orm

from . import core


class Tag(core.Base, core.SerializableMixin):
    """VideoTag.  """

    __tablename__ = 'Tag'
    text = Column(String, primary_key=True)
    videos = orm.relationship('Video', secondary=core.VIDEO_TAG)
