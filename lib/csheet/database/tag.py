# -*- coding=UTF-8 -*-
"""Data models.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from sqlalchemy import Column, String, orm, Integer, Float

from . import core


class Tag(core.Base, core.SerializableMixin):
    """VideoTag.  """

    __tablename__ = 'Tag'
    id = Column(Integer, primary_key=True)
    text = Column(String, unique=True)
    mtime = Column(Float)
    videos = orm.relationship('Video', secondary=core.VIDEO_TAG)

    def serialize(self):
        ret = super(Tag, self).serialize()
        ret['videos'] = [i.uuid for i in self.videos]
        return ret
