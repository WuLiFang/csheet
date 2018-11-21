# -*- coding=UTF-8 -*-
"""RESTful api.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import time

import six
from flask import abort, make_response, session
from flask_restful import Api, Resource, reqparse

from . import core
from .. import database
from ..core import APP
from .login import require_login

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
    @require_login
    def get(id_):
        """Get task info.  """

        token = session['token']

        sess = database.Session()
        task = core.get_task(id_, sess)
        task.update(token, sess)
        sess.commit()
        ret = task.serialize()
        entry = task.to_entry()
        ret['permissions'] = {i: entry.flow.has_field_permission(i)
                              for i in ('leader_status', 'director_status', 'client_status')}
        return ret


API.add_resource(Task, '/task/<id_>')


def _get_entry(uuid):
    sess = database.Session()
    entry = core.get_task(uuid, sess).to_entry()
    entry.token = session['token']
    return entry


class TaskField(Resource):
    """Api for task info"""

    @staticmethod
    @require_login
    def get(uuid, name, **_):
        """Get field info.  """

        entry = _get_entry(uuid)

        return core.get_field_data(entry, name)

    @staticmethod
    @require_login
    def put(uuid, name, **_):
        """Change field value.  """

        parser = reqparse.RequestParser()
        parser.add_argument('value', required=True)
        parser.add_argument('is_status', action='store_true')
        parser.add_argument('message', default='')
        args = parser.parse_args()

        sess = database.Session()
        task = core.get_task(uuid, sess)
        entry = task.to_entry()
        entry.token = session['token']

        if not entry.flow.has_field_permission(name):
            abort(make_response('无权限修改', 403))
        if args.is_status:
            entry.flow.update(name, args.value, args.message)
        else:
            entry[name] = args.value
        return task.get_entry_data(session['token'])


API.add_resource(TaskField, '/task/<uuid>/<name>')


class TaskNote(Resource):
    """Api for task note.  """

    @staticmethod
    @require_login
    def post(uuid, **_):
        """Add new note.  """

        parser = reqparse.RequestParser()
        parser.add_argument('text', required=True)
        args = parser.parse_args()

        entry = _get_entry(uuid)

        entry.notify.add(text=args.text, account=session['account_id'])


API.add_resource(TaskNote, '/task_note/<uuid>')


class Video(Resource):
    """Api for video.  """

    @staticmethod
    def get(id_):
        """Get video info from database.  """
        sess = database.Session()
        video = core.get_video(id_, sess)
        return video.serialize()

    @staticmethod
    def put(id_):
        """Change field value.  """

        parser = reqparse.RequestParser()
        parser.add_argument('key', required=True)
        parser.add_argument('value', required=True)
        args = parser.parse_args()

        sess = database.Session()
        video = core.get_video(id_, sess)
        if args.key not in video.__table__.columns:
            raise KeyError
        setattr(video, args.key, args.value)
        sess.commit()
        return video.serialize()


API.add_resource(Video, '/video/<id_>')


class Tag(Resource):
    """Api for tag.  """

    @staticmethod
    def get(id_):
        """Get tag info from database.  """

        sess = database.Session()
        tag = core.get_tag(id_, sess)
        return tag.serialize()

    @staticmethod
    def post(id_):
        """Link video to tag.  """

        parser = reqparse.RequestParser()
        parser.add_argument('videos', type=six.text_type,
                            required=True, action='append')
        args = parser.parse_args()
        sess = database.Session()
        tag = core.get_tag(id_, sess)
        videos = [core.get_video(i, sess, database.Video)
                  for i in args.videos]
        new_videos = [i for i in videos if i not in tag.videos]
        _update_tags_mtime(new_videos)
        tag.videos += new_videos
        sess.commit()
        return tag.serialize()

    @staticmethod
    def put(id_):
        """Modify tag.  """

        parser = reqparse.RequestParser()
        parser.add_argument('text', required=True)
        args = parser.parse_args()

        sess = database.Session()
        tag = core.get_tag(id_, sess)
        tag.text = args.text
        sess.commit()
        return tag.serialize()

    @staticmethod
    def delete(id_):
        """Delete tag.  """

        sess = database.Session()
        tag = core.get_tag(id_, sess)
        text = tag.text
        sess.delete(tag)
        sess.commit()

        return make_response('已删除标签: {}'.format(text))


def _update_tags_mtime(videos):
    now = time.time()
    for i in videos:
        i.tags_mtime = now


API.add_resource(Tag, '/tag/<id_>')


class TagManage(Resource):
    """Api for tag manage.  """

    @staticmethod
    def get():
        """Get all tag info from database.  """

        sess = database.Session()
        return [i.serialize() for i in sess.query(database.Tag).all()]

    @staticmethod
    def post():
        """Create new tag, return existed tag with same text if any.  """

        parser = reqparse.RequestParser()
        parser.add_argument('text', type=six.text_type,
                            required=True)
        args = parser.parse_args()

        sess = database.Session()
        tag = sess.query(database.Tag).filter_by(
            text=args.text).one_or_none()
        if not tag:
            tag = database.Tag(text=args.text)
            sess.add(tag)
            sess.commit()
        return tag.serialize()


API.add_resource(TagManage, '/tag')


class VideoTag(Resource):
    """Api for video tag.  """

    @staticmethod
    def get(video_id):
        """Get video tag infos.  """

        sess = database.Session()
        video = core.get_video(video_id, sess, database.Video)
        return tuple(i.serialize() for i in video.tags)

    @staticmethod
    def post(video_id):
        """Add tag to video.  """

        sess = database.Session()
        tags = _parse_tags(sess)
        video = core.get_video(video_id, sess, database.Video)
        video.tags += tags
        video.tags_mtime = time.time()
        sess.commit()
        return video.serialize()

    @staticmethod
    def put(video_id):
        """Edit video tags.  """

        parser = reqparse.RequestParser()
        parser.add_argument('tags', type=six.text_type, action='append')
        parser.add_argument('action', type=six.text_type,
                            required=True, choices=('update', 'delete'))
        args = parser.parse_args()

        sess = database.Session()
        tags = [core.get_tag(i, sess)
                for i in args.tags] if args.tags else []
        video = core.get_video(video_id, sess, database.Video)
        if args.action == 'update':
            video.tags = tags
        elif args.action == 'delete':
            video.tags = [i for i in video.tags if i not in tags]
        video.tags_mtime = time.time()
        sess.commit()
        return video.serialize()

    @staticmethod
    def delete(video_id):
        """Remove all tag from video.  """

        sess = database.Session()
        video = core.get_video(video_id, sess, database.Video)
        video.tags = None
        video.tags_mtime = time.time()
        sess.commit()
        return video.serialize()


def _parse_tags(sess):
    parser = reqparse.RequestParser()
    parser.add_argument('tags', type=six.text_type,
                        required=True, action='append')
    args = parser.parse_args()
    return [core.get_tag(i, sess) for i in args.tags]


API.add_resource(VideoTag, '/video_tag/<video_id>')
