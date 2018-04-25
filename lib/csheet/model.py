# -*- coding=UTF-8 -*-
"""Data models.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import logging
from contextlib import closing

from sqlalchemy import Boolean, Column, Float, String, create_engine, orm
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.types import VARCHAR, TypeDecorator, Unicode

from wlf.path import get_unicode as u
from wlf.path import PurePath

from . import setting
from .localdatabase import uuid_from_path

Base = declarative_base()  # pylint: disable=invalid-name
Session = orm.sessionmaker()  # pylint: disable=invalid-name
LOGGER = logging.getLogger(__name__)


class Path(TypeDecorator):
    """Path type."""
    # pylint: disable=abstract-method

    impl = Unicode

    def process_bind_param(self, value, dialect):
        if value is not None:
            value = u(value).replace('\\', '/')
            value = PurePath(value).as_posix()
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            value = PurePath(value)
        return value


class JSONEncodedDict(TypeDecorator):
    """Represents an immutable structure as a json-encoded string.

    Usage::

        JSONEncodedDict(255)

    """
    # pylint: disable=abstract-method

    impl = VARCHAR

    def process_bind_param(self, value, dialect):
        if value is not None:
            value = json.dumps(value)

        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            value = json.loads(value)
        return value


class Video(Base):
    """Video data in local database.  """

    __tablename__ = 'video'
    uuid = Column(String, primary_key=True)
    label = Column(String)
    src = Column(Path)
    poster = Column(Path)
    thumb = Column(Path)
    preview = Column(Path)
    is_need_update = Column(Boolean)
    src_mtime = Column(Float)
    poster_mtime = Column(Float)
    thumb_mtime = Column(Float)
    preview_mtime = Column(Float)
    last_update_time = Column(Float)
    database = Column(String)
    pipeline = Column(String)
    task_info = Column(JSONEncodedDict)
    _is_initiated = False

    def __new__(cls, src=None, poster=None, uuid=None):
        # pylint: disable=unused-argument
        ret = None
        if uuid:
            session = Session()
            with closing(session):
                ret = session.query(cls).filter(cls.uuid == uuid).one_or_none()

                if ret:
                    assert isinstance(ret, cls)
                    ret._is_initiated = True  # pylint: disable=protected-access
        ret = ret or super(Video, cls).__new__(cls)
        return ret

    def __init__(self, src=None, poster=None, uuid=None):
        if self._is_initiated:
            return
        elif not (src or poster):
            raise ValueError('Need at least one of `src` and `poster`')
        uuid = uuid or uuid_from_path(poster or src)
        label = PurePath(poster or src).stem
        super(Video, self).__init__(uuid=uuid,
                                    label=label,
                                    src=src,
                                    poster=poster,
                                    is_need_update=True)
        self._is_initiated = True

    def __repr__(self):
        return 'Video<uuid={0.uuid}, src={0.src}, poster={0.poster}>'.format(self)


def bind(url=None):
    """Bind model to database.  """

    url = url or setting.DATABASE
    LOGGER.debug('Bind to engine: %s', url)
    engine = create_engine(url)
    Session.configure(bind=engine)
    Base.metadata.create_all(engine)
    _upgrade_database(engine)


def _upgrade_database(engine):
    for column, type_ in (('database', 'VARCHAR'), ('pipeline', 'VARCHAR')):
        try:
            engine.execute(
                'ALTER TABLE video ADD COLUMN {} {}'.format(column, type_))
        except OperationalError:
            continue


bind()
