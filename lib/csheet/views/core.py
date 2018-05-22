# -*- coding=UTF-8 -*-
"""Core functionality for web views.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import abort, g, session

import cgtwq

from ..model import CGTeamWorkTask, Session, Video, session_scope
from .datamodel import ProjectInfo, TaskInfo


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
    ret = sess.query(cls).get(uuid)
    if not ret:
        abort(404, 'No such video')
    assert isinstance(ret, cls)
    return ret


def get_select(database, ids):
    """Get task select from database from id list.  """

    module = cgtwq.Database(database)['shot_task']
    return module.select(*ids)


def get_entry(task_id, session_):
    """Get entry from video id and taks_id.  """

    task = session_.query(CGTeamWorkTask).get(task_id)
    if not task:
        abort(404, 'No such task')
    return task.to_entry()


def get_task_data(select):
    """Get task data from cgteamwork.  """

    assert isinstance(select, cgtwq.Selection)
    select.token = session['token']
    data = select.get_fields(*TaskInfo._fields)
    data = [TaskInfo(*i) for i in data]
    data.sort(key=lambda i: i.sort_key())
    data = [_extend_with_permissions(i, select.module) for i in data]
    return data


def _extend_with_permissions(info, module):
    assert isinstance(info, TaskInfo)
    assert isinstance(module, cgtwq.Module)
    entry = module.select(info.id).to_entry()
    entry.token = session['token']
    permissions = {i: entry.flow.has_field_permission(i)
                   for i in info._fields
                   if i.endswith('status')}

    return tuple(list(info) + [permissions])


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
