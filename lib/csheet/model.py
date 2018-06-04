# -*- coding=UTF-8 -*-
"""Data models.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import logging
from collections import namedtuple
from contextlib import contextmanager
from functools import wraps

from sqlalchemy import (Boolean, Column, Float, ForeignKey, String, Table, Integer,
                        create_engine, orm)
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.types import VARCHAR, TypeDecorator, Unicode

import cgtwq
from wlf.path import get_unicode as u
from wlf.path import PurePath

from . import setting

Base = declarative_base()  # pylint: disable=invalid-name
Session = orm.sessionmaker()  # pylint: disable=invalid-name
LOGGER = logging.getLogger(__name__)
VIDEO_TASK = Table('Video-CGTeamWorkTask', Base.metadata,
                   Column('video_id', String, ForeignKey('Video.uuid')),
                   Column('task_id', String, ForeignKey('CGTeamWorkTask.uuid')))


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


class Video(Base, SerializableMixin):
    """Video data in local database.  """

    __tablename__ = 'Video'
    uuid = Column(String, primary_key=True)
    label = Column(String)
    src = Column(Path)
    src_mtime = Column(Float)
    preview = Column(Path)
    preview_mtime = Column(Float)
    preview_atime = Column(Float)
    poster = Column(Path)
    poster_mtime = Column(Float)
    poster_atime = Column(Float)
    thumb = Column(Path)
    thumb_mtime = Column(Float)
    thumb_atime = Column(Float)
    is_need_update = Column(Boolean)
    last_update_time = Column(Float)
    database = Column(String)
    module = Column(String)
    pipeline = Column(String)
    related_tasks = orm.relationship('CGTeamWorkTask', secondary=VIDEO_TASK)
    task_id = Column(String, ForeignKey('CGTeamWorkTask.uuid'))
    task = orm.relationship('CGTeamWorkTask')

    def __init__(self, src=None, poster=None, uuid=None):

        label = None
        if (poster or src):
            label = PurePath(poster or src).stem
        super(Video, self).__init__(uuid=uuid,
                                    label=label,
                                    src=src,
                                    poster=poster,
                                    is_need_update=True)

    def serialize(self):
        ret = super(Video, self).serialize()
        ret['related_tasks'] = [i.uuid for i in self.related_tasks]
        return ret


class TaskInfo(namedtuple(
        'TaskInfo',
        ('pipeline', 'artist', 'leader_status',
         'director_status', 'client_status', 'note_num', 'id'))):
    """Task information.  """

    def sort_key(self):
        """Key for list sort . """

        pipeline = self.pipeline
        return (
            pipeline == '输出',
            pipeline == '合成',
            pipeline == '渲染',
            pipeline == '灯光',
            pipeline == '特效',
            pipeline == '解算',
            pipeline == '动画',
            pipeline == 'Layout',
            pipeline
        )


class TaskDataRow(namedtuple('VideoDataRow',
                             ('id', 'pipeline', 'shot',
                              'image', 'submit_file_path',
                              'artist', 'leader_status',
                              'director_status', 'client_status',
                              'note_num'))):
    """Cgteamwork task data needed.  """

    fields = ('id', 'pipeline', 'shot.shot',
              'image', 'submit_file_path',
              'artist', 'leader_status',
              'director_status', 'client_status',
              'note_num')


class CGTeamWorkTask(Base, SerializableMixin):
    """CGTeamWork task.  """

    __tablename__ = 'CGTeamWorkTask'
    uuid = Column(String, primary_key=True)
    database = Column(String)
    module = Column(String)
    videos = orm.relationship('Video', secondary=VIDEO_TASK)
    pipeline = Column(String)
    shot = Column(String)
    artist = Column(String)
    leader_status = Column(String)
    director_status = Column(String)
    client_status = Column(String)
    note_num = Column(Integer)

    def to_entry(self):
        """Convert to entry.

        Returns:
            cgtwq.Entry
        """

        return cgtwq.Database(self.database).module(self.module).select(self.uuid).to_entry()

    def update(self, token, session):
        """Update task data with cgteamwork database.

        Args:
            session (sqlalchemy.Session): Database session.
        """

        LOGGER.debug('Update task: %s', self.uuid)
        entry = self.to_entry()
        entry.token = token

        data = TaskDataRow(*entry.get_fields(*TaskDataRow.fields))
        self.pipeline = data.pipeline
        self.shot = data.shot
        self.artist = data.artist
        self.leader_status = data.leader_status
        self.director_status = data.director_status
        self.client_status = data.client_status
        self.note_num = data.note_num
        session.add(self)
        session.commit()

    def to_task_info(self):
        """Convert to task info for frontend.  """

        return TaskInfo(
            pipeline=self.pipeline,
            artist=self.artist,
            leader_status=self.leader_status,
            director_status=self.director_status,
            client_status=self.client_status,
            note_num=self.note_num,
            id=self.uuid
        )

    def get_entry_data(self, token):
        """CGTeamWork Entry data for frontend.  """

        data = self.to_task_info()

        entry = self.to_entry()
        entry.token = token
        permissions = {i: entry.flow.has_field_permission(i)
                       for i in TaskInfo._fields
                       if i.endswith('status')}
        data += tuple([permissions])
        return data


def format_videos(videos):
    """Format videos for front end.

    Args:
        videos (list[Video]): Videos to format.

    Returns:
        list[tuple]: Formated video infos.
    """

    ret = []
    for i in videos:
        assert isinstance(i, Video)
        row = i.serialize()
        ret.append(row)
    return ret


def bind(url=None):
    """Bind model to database.  """

    url = url or setting.DATABASE
    LOGGER.debug('Bind to engine: %s', url)
    engine = create_engine(url)
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


bind()
