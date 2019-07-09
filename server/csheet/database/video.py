# -*- coding=UTF-8 -*-
"""Data models.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from sqlalchemy import Boolean, Column, Float, ForeignKey, String, orm

from wlf.path import PurePath

from .. import filepath, filetools
from . import core


class Video(core.Base, core.SerializableMixin):
    """Video data in local database.  """

    __tablename__ = 'Video'
    uuid = Column(String, primary_key=True)
    label = Column(String)
    src = Column(core.Path)
    src_mtime = Column(Float)
    src_broken_mtime = Column(Float)
    preview = Column(core.Path)
    preview_mtime = Column(Float)
    preview_atime = Column(Float)
    preview_broken_mtime = Column(Float)
    poster = Column(core.Path)
    poster_mtime = Column(Float)
    poster_atime = Column(Float)
    poster_broken_mtime = Column(Float)
    thumb = Column(core.Path)
    thumb_mtime = Column(Float)
    thumb_atime = Column(Float)
    thumb_broken_mtime = Column(Float)
    is_need_update = Column(Boolean)
    last_update_time = Column(Float)
    generation_started = Column(Float)
    database = Column(String)
    module = Column(String)
    pipeline = Column(String)
    related_tasks = orm.relationship(
        'CGTeamWorkTask', secondary=core.VIDEO_TASK)
    task_id = Column(String, ForeignKey('CGTeamWorkTask.uuid'))
    task = orm.relationship('CGTeamWorkTask')
    tags = orm.relationship('Tag', secondary=core.VIDEO_TAG)
    tags_mtime = Column(Float)

    def __init__(self, src=None, poster=None, uuid=None, label=None, **kwargs):

        if not label and (poster or src):
            label = PurePath(poster or src).stem
        super(Video, self).__init__(uuid=uuid,
                                    label=label,
                                    src=src,
                                    poster=poster,
                                    **kwargs)

    def serialize(self):
        ret = super(Video, self).serialize()
        ret['related_tasks'] = [i.uuid for i in self.related_tasks]
        ret['tags'] = [i.id for i in self.tags]
        return ret

    def touch(self):
        """Update atime on related files.  """

        for i in [self.thumb, self.poster, self.preview, self.src]:
            if not i:
                continue
            try:
                filetools.touch(filepath.normalize(i))
            except OSError:
                pass
