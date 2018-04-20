# -*- coding=UTF-8 -*-
"""Data models.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os

from sqlalchemy import Column, String, create_engine, orm, Boolean
from sqlalchemy.ext.declarative import declarative_base

from .localdatabase import uuid_from_path

ENGINE = create_engine(os.getenv('CSHEET_DABASE', 'sqlite:///:memory:'))
Base = declarative_base(bind=ENGINE)  # pylint: disable=invalid-name
Session = orm.sessionmaker(bind=ENGINE)  # pylint: disable=invalid-name


class Video(Base):
    """Video data in local database.  """

    __tablename__ = 'video'
    uuid = Column(String, primary_key=True)
    src = Column(String)
    poster = Column(String)
    is_generated = Column(Boolean)
    thumb = Column(String)
    preview = Column(String)

    def __init__(self, src=None, poster=None):
        if not (src or poster):
            raise ValueError('Need at least one of `src` and `poster`')
        uuid = uuid_from_path(src or poster)
        super(Video, self).__init__(uuid=uuid,
                                    src=src,
                                    poster=poster,
                                    is_generated=False)
        session = Session()
        session.add(self)
        session.commit()

    @classmethod
    def from_uuid(cls, uuid_):
        """Get video from uuid.

        Args:
            uuid_ (str): uuid of video.

        Returns:
            Video: video with that uuid.
        """

        session = Session()
        ret = session.query(cls).filter(cls.uuid == uuid_).one()
        assert isinstance(ret, cls)
        return ret


Base.metadata.create_all()
