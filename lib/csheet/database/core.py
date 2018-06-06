# -*- coding=UTF-8 -*-
"""Data models.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import logging
from contextlib import contextmanager
from functools import wraps

from sqlalchemy import Column, ForeignKey, String, Table, create_engine, orm
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.types import VARCHAR, TypeDecorator, Unicode

from wlf.path import get_unicode as u
from wlf.path import PurePath

from .. import setting

Base = declarative_base()  # pylint: disable=invalid-name
Session = orm.sessionmaker()  # pylint: disable=invalid-name
LOGGER = logging.getLogger(__name__)

VIDEO_TASK = Table('Video-CGTeamWorkTask', Base.metadata,
                   Column('video_id', String, ForeignKey('Video.uuid')),
                   Column('task_id', String, ForeignKey('CGTeamWorkTask.uuid')))

VIDEO_TAG = Table('Video-Tag', Base.metadata,
                  Column('video_id', String, ForeignKey('Video.uuid')),
                  Column('tag_id', String, ForeignKey('Tag.text')))


@contextmanager
def session_scope(session=None):
    """Session scope context.  """

    sess = session or Session()

    try:
        yield sess
        sess.commit()
    except:
        sess.rollback()
        raise
    finally:
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


class JSONEncodedDict(TypeDecorator):
    """Represents an immutable structure as a json-encoded string.

    Usage::

        JSONEncodedDict(255)

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


def bind(uri=None):
    """Bind model to database.  """

    uri = uri or setting.ENGINE_URI
    LOGGER.debug('Bind to engine: %s', uri)
    engine = create_engine(uri)
    Session.configure(bind=engine)
    Base.metadata.create_all(engine)
    _upgrade_database(engine)


def _upgrade_database(engine):
    for column, type_ in (('database', 'VARCHAR'),
                          ('pipeline', 'VARCHAR'),
                          ('thumb_atime', 'FLOAT'),
                          ('preview_atime', 'FLOAT'),
                          ('poster_atime', 'FLOAT'),
                          ('module', 'VARCHAR'),
                          ('task_id', 'VARCHAR')):
        try:
            engine.execute(
                'ALTER TABLE Video ADD COLUMN {} {}'.format(column, type_))
        except OperationalError:
            continue
    for column, type_ in (('artist', 'VARCHAR'),
                          ('shot', 'VARCHAR'),
                          ('pipeline', 'VARCHAR'),
                          ('leader_status', 'VARCHAR'),
                          ('director_status', 'VARCHAR'),
                          ('client_status', 'VARCHAR'),
                          ('note_num', 'INTEGER'),):
        try:
            engine.execute(
                'ALTER TABLE CGTeamWorkTask ADD COLUMN {} {}'.format(column, type_))
        except OperationalError:
            continue
