# -*- coding=UTF-8 -*-
"""RESTful api.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import session, make_response, abort
from flask_restful import Api, Resource, reqparse

import cgtwq

from . import core
from ..database import get_project_info
from .app import APP
from .util import require_login

API = Api(APP, '/api')


def _apply_token(func, *args, **kwargs):
    token = session['token']
    return func(*args, token=token, **kwargs)


@APP.route('/api/database/<project>')
@require_login
def database_name(project):
    """get database for project.   """
    return _apply_token(get_project_info, project).database


@APP.route('/api/project_code/<project>')
def project_code(project):
    """Get project code from project name.  """

    return _apply_token(get_project_info, project).code


class Task(Resource):
    """Api for video related task.  """

    @staticmethod
    def get(id_):
        """Get task info.  """

        with core.database_session() as sess:
            video = core.get_video(id_, sess)
            select = video.get_select()
        return core.get_task_data(select)


API.add_resource(Task, '/task/<id_>')


class TaskField(Resource):
    """Api for task info"""

    @staticmethod
    def get(video_id, task_id, name):
        """Get field info.  """

        with core.database_session() as sess:
            video = core.get_video(video_id, sess)
            entry = _get_entry(video, task_id)
        ret = {}
        ret['value'] = entry[name]
        ret['has_permission'] = entry.flow.has_field_permission(name)
        return ret

    @staticmethod
    def put(video_id, task_id, name):
        """Change field value.  """

        parser = reqparse.RequestParser()
        parser.add_argument('value', required=True)
        args = parser.parse_args()

        with core.database_session() as sess:
            video = core.get_video(video_id, sess)
            entry = _get_entry(video, task_id)

        if not entry.flow.has_field_permission(name):
            abort(make_response('无权限修改', 403))
        entry[name] = args.value
        return entry[name]


def _get_entry(video, id_):
    module = cgtwq.Database(video.database).module('shot_task')
    select = module.select(id_).to_entry()
    select.token = session['token']
    return select


API.add_resource(TaskField, '/video/<video_id>/task/<task_id>/<name>')


class TaskNote(Resource):
    """Api for task note.  """

    @staticmethod
    def post(video_id, task_id):
        """Add new note.  """

        parser = reqparse.RequestParser()
        parser.add_argument('text', required=True)
        args = parser.parse_args()

        with core.database_session() as sess:
            video = core.get_video(video_id, sess)
            entry = _get_entry(video, task_id)

        entry.notify.add(text=args.text, account=session['account_id'])


API.add_resource(TaskNote, '/video/<video_id>/task_note/<task_id>')


class Video(Resource):
    """Api for video.  """

    @staticmethod
    def get(id_):
        """Get video info from database.  """
        with core.database_session() as sess:
            video = core.get_video(id_, sess)
            return video.serialize()


API.add_resource(Video, '/video/<id_>')
