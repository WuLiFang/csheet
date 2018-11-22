# -*- coding=UTF-8 -*-
"""Data models.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
from contextlib import contextmanager
from functools import wraps

from flask import json
from sqlalchemy import (Column, ForeignKey, Integer, String, Table,
                        create_engine, orm)
from sqlalchemy.exc import OperationalError, ProgrammingError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.types import VARCHAR, TypeDecorator, Unicode

from wlf.path import PurePath
from wlf.path import get_unicode as u

# pylint: disable=invalid-name
Base = declarative_base()
session_factory = orm.sessionmaker()
Session = orm.scoped_session(session_factory)
# pylint: enable=invalid-name

LOGGER = logging.getLogger(__name__)
VIDEO_TASK = Table('Video-CGTeamWorkTask', Base.metadata,
                   Column('video_id', String, ForeignKey('Video.uuid')),
                   Column('task_id', String, ForeignKey('CGTeamWorkTask.uuid')))

VIDEO_TAG = Table('Video-Tag', Base.metadata,
                  Column('video_id', String, ForeignKey('Video.uuid')),
                  Column('tag_id', Integer, ForeignKey('Tag.id')))


@contextmanager
def session_scope(session=None, is_close=False):
    """Session scope context.  """

    sess = session or Session()

    try:
        yield sess
        sess.commit()
    except:
        sess.rollback()
        raise
    finally:
        if is_close:
            sess.close()


def _skip_process_if_is_none(process):

    @wraps(process)
    def _process(self, value, dialect):
        if value is None:
            return value
        return process(self, value, dialect)

    return _process


class Path(TypeDecorator):
    """Path type."""
    # pylint: disable=abstract-method

    impl = Unicode

    @_skip_process_if_is_none
    def process_bind_param(self, value, dialect):
        ret = u(value).replace('\\', '/')
        ret = PurePath(value).as_posix()
        return ret

    @_skip_process_if_is_none
    def process_result_value(self, value, dialect):
        return PurePath(value)


class JSONData(TypeDecorator):
    """Represents an immutable structure as a json-encoded string.

    Usage::

        JSONData(255)

    """
    # pylint: disable=abstract-method

    impl = VARCHAR

    @_skip_process_if_is_none
    def process_bind_param(self, value, dialect):
        return json.dumps(value)

    @_skip_process_if_is_none
    def process_result_value(self, value, dialect):
        return json.loads(value)


class SerializableMixin(object):
    """Mixin for serialization.   """

    # pylint: disable=too-few-public-methods

    @classmethod
    def _encode(cls, obj):
        if isinstance(obj, PurePath):
            return obj.as_posix()
        return obj

    def serialize(self):
        """Serialize sqlalchemy object to dictionary.  """

        return {i.name: self._encode(getattr(self, i.name)) for i in self.__table__.columns}


def bind(url, is_echo=False):
    """Bind model to database.  """

    LOGGER.debug('Bind to engine: %s', url)
    engine = create_engine(url, echo=is_echo)
    session_factory.configure(binds={Base: engine})
    Base.metadata.create_all(engine)
    _migrate(engine)


def _migrate(engine):
    for sql in ('ALTER TABLE CGTeamWorkTask RENAME COLUMN artist TO artists',):
        try:
            engine.execute(sql)
        except (OperationalError, ProgrammingError):
            continue
