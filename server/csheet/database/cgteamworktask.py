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


class CGTeamWorkTask(core.Base, core.SerializableMixin):
    """CGTeamWork task.  """

    __tablename__ = 'CGTeamWorkTask'
    uuid = Column(String, primary_key=True)
    database = Column(String)
    module = Column(String)
    videos = orm.relationship('Video', secondary=core.VIDEO_TASK)
    pipeline = Column(String)
    shot = Column(String)
    artists = Column(core.JSONData)
    leader_status = Column(String)
    director_status = Column(String)
    client_status = Column(String)
    note_num = Column(Integer, default=0)

    def to_entry(self, token):
        """Convert to entry.

        Returns:
            cgtwq.Entry
        """

        ret = cgtwq.Database(self.database).module(
            self.module).select(self.uuid).to_entry()
        ret.token = token
        return ret

    def update(self, token, session):
        """Update task data with cgteamwork database.

        Args:
            session (sqlalchemy.Session): Database session.
        Returns:
            cgtwq.Entry: Used entry.
        """

        session.add(self)
        LOGGER.debug('Update task: %s', self.uuid)
        entry = self.to_entry(token)

        try:
            instance = (TaskDataRow(*entry.get_fields(*TaskDataRow.fields))
                        .parse(self.database, self.module))
            session.merge(instance)
        except cgtwq.EmptySelection:
            session.delete(instance)
            raise
        return entry


class TaskDataRow(namedtuple('VideoDataRow',
                             ('id', 'pipeline', 'shot',
                              'image', 'submit_file_path',
                              'artist', 'leader_status',
                              'director_status', 'client_status',
                              'note_num',))):
    """Cgteamwork task data needed.  """

    fields = ('id', 'pipeline', 'shot.shot',
              'image', 'submit_file_path',
              'artist', 'leader_status',
              'director_status', 'client_status',
              'note_num')

    def parse(self, database: str, module: str) -> CGTeamWorkTask:
        """Parse data row to task record.

        Args:
            database (str): Database name
            module (str): Module name

        Returns:
            CGTeamWorkTask
        """

        return CGTeamWorkTask(
            uuid=self.id,
            database=database,
            module=module,
            pipeline=self.pipeline,
            artists=self.artist.split(',') if self.artist else [],
            shot=self.shot,
            leader_status=self.leader_status,
            director_status=self.director_status,
            client_status=self.client_status,
            note_num=int(self.note_num) if self.note_num else 0,)
