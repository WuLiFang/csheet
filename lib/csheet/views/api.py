# -*- coding=UTF-8 -*-
"""RESTful api.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import session
from flask_restful import Api, Resource, reqparse

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
def database(project):
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
    def get(id_, name):
        """Get field info.  """

        ret = {}
        with core.database_session() as sess:
            video = core.get_video(id_, sess)
            entry = video.get_entry()
        ret['value'] = entry[name]
        ret['has_permission'] = entry.has_permission_on_status(name)
        return ret

    @staticmethod
    def put(id_, name):
        """Change field value.  """

        parser = reqparse.RequestParser()
        parser.add_argument('value', required=True)
        args = parser.parse_args()

        with core.database_session() as sess:
            video = core.get_video(id_, sess)
            entry = video.get_entry()
        entry[name] = args.value
        return entry[name]


API.add_resource(TaskField, '/task/<id_>/<name>')


class Video(Resource):
    """Api for video.  """

    @staticmethod
    def get(id_):
        """Get video info from database.  """
        with core.database_session() as sess:
            video = core.get_video(id_, sess)
            return video.serialize()


API.add_resource(Video, '/video/<id_>')
