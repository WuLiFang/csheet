# -*- coding=UTF-8 -*-
"""RESTful api.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import session, make_response, abort
from flask_restful import Api, Resource, reqparse


from . import core
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
    return _apply_token(core.get_project_info, project).database


@APP.route('/api/project_code/<project>')
def project_code(project):
    """Get project code from project name.  """

    return _apply_token(core.get_project_info, project).code


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
    def get(uuid, name, **_):
        """Get field info.  """

        with core.database_session() as sess:
            entry = core.get_entry(uuid, sess)
        return core.get_field_data(entry, name)

    @staticmethod
    def put(uuid, name, **_):
        """Change field value.  """

        parser = reqparse.RequestParser()
        parser.add_argument('value', required=True)
        args = parser.parse_args()

        with core.database_session() as sess:
            entry = core.get_entry(uuid, sess)

        if not entry.flow.has_field_permission(name):
            abort(make_response('无权限修改', 403))
        entry[name] = args.value
        return entry[name]


API.add_resource(TaskField, '/task/<uuid>/<name>')


class TaskNote(Resource):
    """Api for task note.  """

    @staticmethod
    def post(uuid, **_):
        """Add new note.  """

        parser = reqparse.RequestParser()
        parser.add_argument('text', required=True)
        args = parser.parse_args()

        with core.database_session() as sess:
            entry = core.get_entry(uuid, sess)

        entry.notify.add(text=args.text, account=session['account_id'])


API.add_resource(TaskNote, '/task_note/<uuid>')


class Video(Resource):
    """Api for video.  """

    @staticmethod
    def get(id_):
        """Get video info from database.  """
        with core.database_session() as sess:
            video = core.get_video(id_, sess)
            return video.serialize()


API.add_resource(Video, '/video/<id_>')

API.add_resource(TaskField, '/video/<_>/task/<uuid>/<name>',
                 endpoint=b'deprecated_api_taskfield')
API.add_resource(TaskNote, '/video/<_>/task_note/<uuid>',
                 endpoint=b'deprecated_api_tasknote')
