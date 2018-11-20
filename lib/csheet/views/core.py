# -*- coding=UTF-8 -*-
"""Core functionality for web views.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import abort, session

import cgtwq

from ..database import CGTeamWorkTask, Tag, Video
from .datamodel import ProjectInfo


class CGTeamWorkVideo(Video):
    """Video for cgteamwork task.  """

    def get_entry(self):
        """Get entry from this video.  """

        return self.task.to_entry()

    def get_select(self):
        """Get related selection from this video.  """

        id_list = [i.uuid for i in self.related_tasks]
        if not id_list:
            abort(404, 'Not found related cgteamwork task.')
        return cgtwq.Database(
            self.database).module(
                self.module).select(*id_list)


def get_video(uuid, sess, cls=CGTeamWorkVideo):
    """Get video from uuid.  """

    assert issubclass(cls, Video)
    return _get_model(uuid, sess, cls)


def get_select(database, ids):
    """Get task select from database from id list.  """

    module = cgtwq.Database(database)['shot']
    return module.select(*ids)


def _get_model(uuid, sess, cls):
    ret = sess.query(cls).get(uuid)
    if not ret:
        abort(404, 'No such {}'.format(cls.__name__))
    assert isinstance(ret, cls)
    return ret


def get_task(task_id, session_):
    """Get entry from taks_id.  """

    return _get_model(task_id, session_, CGTeamWorkTask)


def get_tag(tag_id, session_):
    """Get tag from tag_id.  """

    return _get_model(tag_id, session_, Tag)


def get_field_data(entry, name):
    """Get field data from cgteam work.  """

    assert isinstance(entry, cgtwq.Entry)
    entry.token = session['token']
    ret = {}
    ret['value'] = entry[name]
    ret['has_permission'] = entry.flow.has_field_permission(name)
    return ret


def get_project_info(project, token):
    """Get proejct info for @project.  """

    cgtwq.PROJECT.token = token
    entry = cgtwq.PROJECT.filter(cgtwq.Filter('full_name', project)).to_entry()
    data = entry.get_fields('code', 'database')
    return ProjectInfo(project, *data)
