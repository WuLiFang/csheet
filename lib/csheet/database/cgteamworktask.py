# -*- coding=UTF-8 -*-
"""Data models.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
from collections import namedtuple

from sqlalchemy import Column, Integer, String, orm

import cgtwq

from . import core

LOGGER = logging.getLogger(__name__)


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


class CGTeamWorkTask(core.Base, core.SerializableMixin):
    """CGTeamWork task.  """

    __tablename__ = 'CGTeamWorkTask'
    uuid = Column(String, primary_key=True)
    database = Column(String)
    module = Column(String)
    videos = orm.relationship('Video', secondary=core.VIDEO_TASK)
    pipeline = Column(String)
    shot = Column(String)
    artist = Column(String)
    leader_status = Column(String)
    director_status = Column(String)
    client_status = Column(String)
    note_num = Column(Integer, default=0)

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
        self.note_num = int(data.note_num) if data.note_num else 0
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
