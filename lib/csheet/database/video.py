# -*- coding=UTF-8 -*-
"""Data models.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from sqlalchemy import Boolean, Column, Float, ForeignKey, String, orm

from wlf.path import PurePath

from . import core


class Video(core.Base, core.SerializableMixin):
    """Video data in local database.  """

    __tablename__ = 'Video'
    uuid = Column(String, primary_key=True)
    label = Column(String)
    src = Column(core.Path)
    src_mtime = Column(Float)
    preview = Column(core.Path)
    preview_mtime = Column(Float)
    preview_atime = Column(Float)
    poster = Column(core.Path)
    poster_mtime = Column(Float)
    poster_atime = Column(Float)
    thumb = Column(core.Path)
    thumb_mtime = Column(Float)
    thumb_atime = Column(Float)
    is_need_update = Column(Boolean)
    last_update_time = Column(Float)
    database = Column(String)
    module = Column(String)
    pipeline = Column(String)
    related_tasks = orm.relationship(
        'CGTeamWorkTask', secondary=core.VIDEO_TASK)
    task_id = Column(String, ForeignKey('CGTeamWorkTask.uuid'))
    task = orm.relationship('CGTeamWorkTask')
    tags = orm.relationship('Tag', secondary=core.VIDEO_TAG)
    tags_mtime = Column(Float)

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
        ret['tags'] = [i.id for i in self.tags]
        return ret

    @staticmethod
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
