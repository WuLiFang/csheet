# -*- coding=UTF-8 -*-
"""Core functionality for web views.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import abort, g, session

import cgtwq

from ..model import Session, session_scope
from ..video import HTMLVideo
from ..model import Video
from .datamodel import TaskInfo


def database_session():
    """Get database session.  """

    if not hasattr(g, 'database_session'):
        g.database_session = Session()
    sess = g.database_session

    return session_scope(sess)


class CGTeamWorkVideo(Video):
    """Video for cgteamwork task.  """

    def get_entry(self):
        """Get entry from this video.  """
        return get_select(self.database, self.uuid).to_entry()

    def get_select(self):
        """Get related selection from this video.  """
        return get_select(self.database, self.task_info['task_id'])


def get_video(uuid, sess, cls=CGTeamWorkVideo):
    """Get video from uuid.  """

    assert issubclass(cls, Video)
    ret = sess.query(cls).get(uuid)
    if not ret:
        abort(404, 'No such video')
    assert isinstance(ret, cls)
    return ret


def get_select(database, ids):
    """Get task select from database from id list.  """

    module = cgtwq.Database(database)['shot_task']
    select = module.select(*ids)
    assert isinstance(select, cgtwq.Selection)
    select.token = session['token']
    return select


def get_task_data(select):
    """Get task data from cgteamwork.  """

    data = select.get_fields(*TaskInfo._fields)
    data = [TaskInfo(*i) for i in data]
    data.sort(key=lambda i: i.sort_key())

    return data
