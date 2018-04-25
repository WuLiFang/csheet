# -*- coding=UTF-8 -*-
"""Database connection.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import logging
from contextlib import closing
from multiprocessing.dummy import Pool

from gevent import sleep

import cgtwq

from sqlalchemy.exc import OperationalError
from .exceptions import u_abort
from .filename import filter_filename
from .image import HTMLImage
from .model import Session, Video
from .page import updated_config
from .video import HTMLVideo

RENDER_PIPELINE = {'灯光':  '渲染', '合成':  '输出'}
LOGGER = logging.getLogger(__name__)


def get_image(uuid):
    """Get image from uuid.   """

    try:
        image = HTMLImage.from_uuid(uuid)
        assert isinstance(image, HTMLImage)
        return image
    except (KeyError, ValueError):
        u_abort(404, 'No image match this uuid.')


def get_images(database, pipeline, prefix, token=None):
    """Get all images in specifc range.  """

    database = cgtwq.Database(database)
    database.token = token
    module = database['shot_task']
    select = module.filter(cgtwq.Filter('pipeline', pipeline) &
                           cgtwq.Filter('shot.shot', prefix, 'has'))
    shots = [i for i in select['shot.shot'] if i and i.startswith(prefix)]

    # Filebox for non-existed image.
    fileboxes = database.get_fileboxes(
        cgtwq.Filter(
            '#pipeline_id',
            database.get_pipelines(cgtwq.Filter('name', pipeline))[0].id) &
        cgtwq.Filter('title', ['单帧图', '检查单帧图']))

    # Related task for image info and preview.
    related_select = module.filter(cgtwq.Field('shot.shot') | shots)
    related_data = related_select.get_fields(
        'id', 'pipeline', 'shot.shot', 'image', 'submit_file_path')
    related_data = sorted(related_data, key=lambda i: i[2])
    sleep(1e-5)

    previews = {i[2]: i[4]
                for i in related_data
                if i[1] == {'灯光':  '渲染'}.get(pipeline, pipeline)}

    def _getimage(data):
        id_, _, shot, image_data, _ = data

        try:
            path = json.loads(image_data)['image_path']
        except (TypeError, KeyError):
            _select = module.select(id_)
            path = '{}/{}.jpg'.format(
                _select.filebox.get(id_=fileboxes[0].id).path, shot)
            sleep(1e-5)
        img = HTMLImage(path)
        img.cgteamwork_select = module.select(
            *[i[0] for i in related_data if i[2] == shot]
        )

        # Set image preview source.
        try:
            data = previews.get(shot)
            if data:
                img.source['preview'] = filter_filename(
                    json.loads(data)['file_path'][0])
        except (TypeError, IndexError):
            pass
        return img

    return [_getimage(i) for i in [i for i in related_data if i[1] == pipeline]]


def get_videos(database, pipeline, prefix, token=None):
    """Get all videos in specifc range.  """

    database = cgtwq.Database(database)
    database.token = token
    module = database['shot_task']

    select = module.filter(cgtwq.Filter('pipeline', pipeline) &
                           cgtwq.Filter('shot.shot', prefix, 'has'))
    shots = [i for i in select['shot.shot'] if i and i.startswith(prefix)]

    # Filebox for non-existed image.
    fileboxes = database.get_fileboxes(
        cgtwq.Filter(
            '#pipeline_id',
            database.get_pipelines(cgtwq.Filter('name', pipeline))[0].id) &
        cgtwq.Filter('title', ['单帧图', '检查单帧图']))

    # Related task for image info and preview.
    related_select = module.filter(cgtwq.Field('shot.shot') | shots)
    related_data = related_select.get_fields(
        'id', 'pipeline', 'shot.shot', 'image', 'submit_file_path')
    related_data = sorted(related_data, key=lambda i: i[2])
    session = Session()
    sleep(1e-5)

    def _get_poster(shot):
        data = [i for i in related_data
                if i[1] == pipeline and i[2] == shot][0]
        id_, _, shot, image_data, _ = data

        try:
            path = json.loads(image_data)['image_path']
        except (TypeError, KeyError):
            _select = module.select(id_)
            path = '{}/{}.jpg'.format(
                _select.filebox.get(id_=fileboxes[0].id).path, shot)
            sleep(1e-5)
        return path

    def _get_src(shot):
        shot_related_data = [i for i in related_data if i[2] == shot]

        pipeline_order = [pipeline]
        video_pipeline = RENDER_PIPELINE.get(pipeline)
        if video_pipeline:
            pipeline_order.insert(0, video_pipeline)

        for i in pipeline_order:
            try:
                submit_data = [j[4] for j in shot_related_data if j[1] == i][0]
            except IndexError:
                continue
            try:
                return json.loads(submit_data)['file_path'][0]
            except (TypeError, IndexError):
                pass
        return None

    def _get_video(shot):
        try:
            src = _get_src(shot)
            poster = _get_poster(shot)
            data = [i for i in related_data
                    if i[1] == pipeline and i[2] == shot][0]
            ret = HTMLVideo(src, poster, uuid=data[0])
            ret.label = shot
            if src:
                ret.src = src
            if poster:
                ret.poster = poster
            ret.database = database.name
            ret.pipeline = pipeline
            ret.task_info = {
                'db': database.name,
                'module': module.name,
                'task_id': [i[0] for i in related_data if i[2] == shot]
            }
            return ret
        except:
            logging.error('Error during get video.', exc_info=True)
            raise

    with closing(session):
        ret = session.query(HTMLVideo).filter(
            HTMLVideo.database == database.name,
            HTMLVideo.pipeline == pipeline,
            HTMLVideo.label.in_(shots)
        ).all()
        cached_shots = [i.label for i in ret]
        LOGGER.debug('Use cached shots: %s', ret)
        pool = Pool()
        ret += pool.map(_get_video,
                        (i for i in shots if i not in cached_shots))
        session.add_all(ret)
        session.commit()
        return ret


def get_csheet_config(project, pipeline, prefix, **kwargs):
    """Provide infos a csheet needed.  """

    token = kwargs.get('token')
    cgtwq.PROJECT.token = token
    database = cgtwq.PROJECT.filter(
        cgtwq.Filter('full_name', project))['database'][0]

    config = {
        'project': project,
        'database': database,
        'pipeline': pipeline,
        'prefix': prefix,
        'images': get_videos(database, pipeline=pipeline, prefix=prefix, **kwargs),
        'title': '{}色板'.format('_'.join(
            i for i in
            (project, prefix.strip(get_project_code(project, token)).strip('_'), pipeline) if i)),
    }
    return updated_config(config)


def get_project_code(project, token):
    """Get proejct code for @project.  """
    cgtwq.PROJECT.token = token
    try:
        return cgtwq.PROJECT.filter(cgtwq.Filter('full_name', project))['code'][0]
    except IndexError:
        u_abort(404, 'No such project.')


def get_database(project, token):
    """Get proejct database for @project.  """
    cgtwq.PROJECT.token = token
    try:
        return cgtwq.PROJECT.filter(cgtwq.Filter('full_name', project))['database'][0]
    except IndexError:
        u_abort(404, 'No such project.')
