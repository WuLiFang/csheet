# -*- coding=UTF-8 -*-
"""Database connection.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json

from wlf import cgtwq
from .html import updated_config, HTMLImage
from .exceptions import u_abort


def get_image(uuid):
    """Get image from uuid.   """

    try:
        image = HTMLImage.from_uuid(uuid)
        assert isinstance(image, HTMLImage)
        return image
    except (KeyError, ValueError):
        u_abort(404, 'No image match this uuid.')


def get_images(database, pipeline, prefix):
    """Get all images in specifc range.  """

    database = cgtwq.Database(database)
    module = database['shot_task']
    select = module.filter(cgtwq.Filter('pipeline', pipeline))
    shots = [i for i in select['shot.shot'] if i and i.startswith(prefix)]

    # Filebox for non-existed image.
    fileboxes = database.get_fileboxes(
        cgtwq.Filter(
            '#pipeline_id',
            database.get_piplines(cgtwq.Filter('name', pipeline))[0].id) &
        cgtwq.Filter('title', ['单帧图', '检查单帧图']))

    # Related task for image info and preview.
    related_select = module.filter(cgtwq.Filter('shot.shot', shots))
    related_data = related_select.get_fields(
        'id', 'pipeline', 'shot.shot', 'image', 'submit_file_path')
    related_data.sort(key=lambda x: x[2])

    previews = {i[2]: i[4]
                for i in related_data
                if i[1] == {'灯光':  '渲染'}.get(pipeline, pipeline)}

    ret = []
    for i in related_data:
        id_, _pipeline, shot, image_data, _ = i
        if _pipeline != pipeline:
            continue

        try:
            path = json.loads(image_data)['image_path']
        except (TypeError, KeyError):
            _select = module.select(id_)
            path = '{}/{}.jpg'.format(
                _select.get_filebox(id_=fileboxes[0].id).path, shot)

        img = HTMLImage(path)
        img.cgteamwork_select = module.select(
            *[i[0] for i in related_data if i[2] == shot]
        )

        # Set image preview source.
        try:
            data = previews.get(shot)
            if data:
                img.source['preview'] = json.loads(data)['path'][0]
        except (TypeError, IndexError):
            pass
        ret.append(img)
    return ret


def get_csheet_config(project, pipeline, prefix):
    """Provide infos a csheet needed.  """

    database = cgtwq.PROJECT.filter(
        cgtwq.Filter('full_name', project))['database'][0]
    config = {
        'project': project,
        'database': database,
        'pipeline': pipeline,
        'prefix': prefix,
        'images': get_images(database, pipeline=pipeline, prefix=prefix),
        'title': '{}色板'.format('_'.join(
            i for i in
            (project, prefix.strip(get_project_code(project)).strip('_'), pipeline) if i)),
    }
    return updated_config(config)


def get_project_code(project):
    """Get proejct code for @project.  """

    try:
        return cgtwq.PROJECT.filter(cgtwq.Filter('full_name', project))['code'][0]
    except IndexError:
        u_abort(404, 'No such project.')
