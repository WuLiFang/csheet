# -*- coding=UTF-8 -*-
"""Run as web app.  """
from __future__ import absolute_import, print_function, unicode_literals

import json
import time
from os import SEEK_END
from os.path import basename, getmtime, join
from tempfile import TemporaryFile, gettempdir
from zipfile import ZipFile

from diskcache import FanoutCache
from flask import (Flask, Response, abort, escape, make_response, redirect,
                   render_template, request, send_file)
from gevent import sleep, spawn
from gevent.queue import Empty, Queue
from six import text_type

from wlf import cgtwq
from wlf.path import Path

from . import __version__
from .html import HTMLImage, from_dir, get_images_from_dir, updated_config

APP = Flask(__name__)
APP.config['PACK_FOLDER'] = 'D:/'
APP.secret_key = ('}w\xb7\xa3]\xfaI\x94Z\x14\xa9\xa5}\x16\xb3'
                  '\xf7\xd6\xb2R\xb0\xf5\xc6*.\xb3I\xb7\x066V\xd6\x8d')
APP.config['version'] = __version__
APP.config['preview_limit_size'] = 10 * 2 ** 20  # 10MB
STATUS = {}
PROGRESS_EVENT_LISTENER = []
CACHE = FanoutCache(join(gettempdir(), 'csheet_server/cache'))


def u_abort(status, msg):
    """Abort with unicode message.  """

    abort(make_response(escape(text_type(msg)), status, {
        'Content-Type': 'text/html; charset=utf-8'}))


@APP.route('/', methods=('GET',))
def render_main():
    """main page.  """

    if APP.config.get('local_dir'):
        return redirect('/local')

    if not cgtwq.CGTeamWorkClient.is_logged_in():
        u_abort(503, '服务器无法连接到CGTeamWork')

    args = request.args
    if not args:
        return render_template('index.html', projects=cgtwq.PROJECT.names())

    try:
        project = args['project']
        prefix = args.get('prefix')
        pipeline = args.get('pipeline')

        config = get_csheet_config(project, pipeline, prefix)

        if 'pack' in args:
            return packed_page(**config)

        config['is_client'] = True

        # Respon with cookies set.
        resp = make_response(render_template('csheet_app.html', **config))
        cookie_life = 60 * 60 * 24 * 90
        resp.set_cookie('project', project, max_age=cookie_life)
        resp.set_cookie('pipeline', pipeline, max_age=cookie_life)
        resp.set_cookie('prefix', prefix, max_age=cookie_life)

        return resp
    except Exception as ex:
        u_abort(500, ex)
        raise


@APP.route('/local')
def render_local_dir():
    """Render page for local dir.  """

    local_dir = APP.config['local_dir']
    if not Path(local_dir).exists():
        abort(404)

    if request.args.get('pack'):
        return packed_page(images=get_images_from_dir(local_dir))

    return from_dir(local_dir, is_client=True, relative_to=local_dir)


def get_image(uuid):
    """Get image from uuid.   """

    try:
        image = HTMLImage.from_uuid(uuid)
        assert isinstance(image, HTMLImage)
        return image
    except (KeyError, ValueError):
        abort(404, 'No image match this uuid.')


@APP.route('/images/<uuid>.<role>')
def response_image(uuid, role):
    """Response file for a image.

    Decorators:
        APP

    Args:
        uuid (str): Image uuid.
        role (str): Role of wanted file.

    Returns:
        flask.Response: Response for client.
    """

    image = get_image(uuid)
    kwargs = {}
    folder = APP.config.get('storage')
    if folder:
        kwargs['output'] = join(folder, role, uuid)

    result = Queue(1)

    def _gen():
        try:
            ret = image.generate(role,
                                 is_strict=role not in ('thumb', 'full'),
                                 limit_size=APP.config['preview_limit_size'],
                                 **kwargs)
            result.put(ret)
        except Exception as ex:  # pylint: disable=broad-except
            result.put(ex)
    spawn(_gen)
    sleep()

    try:
        generated = result.get(block=False)
        if isinstance(generated, ValueError):
            raise Empty
        if isinstance(generated, Exception):
            u_abort(500, generated)

        if not Path(generated).exists():
            try:
                del image.generated[role]
            except KeyError:
                pass
            return make_response('Generated file has been moved', 503, {'Retry-After': 10})

        resp = send_file(text_type(generated), conditional=True)
        resp.cache_control.max_age = 0
        resp.cache_control.no_cache = True
        if request.args:
            resp.cache_control.no_store = True
        return resp
    except Empty:
        return make_response('Image not ready.', 503, {'Retry-After': 10})


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


@APP.route('/images/<uuid>.info')
def image_info(uuid):
    """Get image related information.   """

    image = get_image(uuid)

    try:
        select = image.cgteamwork_select
    except AttributeError:
        abort(404, 'No related task found.')

    assert isinstance(select, cgtwq.database.Selection)
    data = select.get_fields(
        'pipeline', 'artist', 'leader_status', 'director_status', 'client_status', 'note_num')
    data.sort(key=lambda i: (
        i[0] == '合成',
        i[0] == '渲染',
        i[0] == '灯光',
        i[0] == '特效',
        i[0] == '解算',
        i[0] == '动画',
        i[0] == 'Layout',
    ))

    metadata = {}
    for v in image.source.values():
        if v in metadata:
            # Skip same file to reduce io.
            continue
        try:
            _mtime = getmtime(text_type(v))
        except OSError:
            _mtime = None
        _data = (basename(text_type(v)), _mtime)
        metadata[v] = _data

    metadata = sorted(metadata.values(), key=lambda x: x[1])
    metadata = [(i[0],
                 time.strftime('%x %X', time.localtime(i[1]))
                 if i[1] else '<获取失败>')
                for i in metadata]
    return render_template('image_info.html', data=data, metadata=metadata)


@APP.route('/images/<uuid>.notes/<pipeline>')
def image_notes(uuid, pipeline):
    image = get_image(uuid)
    select = image.cgteamwork_select
    assert isinstance(select, cgtwq.database.Selection)
    select = select.filter(cgtwq.Field('pipeline') == pipeline)
    notes = select.get_notes()
    return render_template('image_notes.html', notes=notes, server_ip=cgtwq.CGTeamWorkClient.server_ip())


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
        'pack_progress': pack_progress()
    }
    return updated_config(config)


def pack_progress(value=None):
    """Return server pack progress status.  """

    if value is not None:
        old_value = STATUS.get('PACK_PROGRESS')
        STATUS['PACK_PROGRESS'] = value
        if old_value != value:
            for queue in PROGRESS_EVENT_LISTENER:
                queue.put(value)

    return str(STATUS.get('PACK_PROGRESS', -1))


@APP.route('/pack_progress')
def pack_event():
    def _sse(data):
        return 'data: {}\n\n'.format(data)

    if request.headers.get('accept') == 'text/event-stream':
        def events():
            queue = Queue()
            PROGRESS_EVENT_LISTENER.append(queue)
            try:
                while True:
                    yield _sse(queue.get())
            except GeneratorExit:
                PROGRESS_EVENT_LISTENER.remove(queue)

        return Response(events(), content_type='text/event-stream')
    return pack_progress()


def packed_page(**config):
    """Return zip packed local version.  """

    if float(pack_progress()) != -1:
        abort(429)
    config = updated_config(config)
    pack_progress(0)

    f = TemporaryFile(suffix='.zip',
                      prefix=config.get('title', 'packing_csheet_'),
                      dir=APP.config.get('PACK_FOLDER'))
    filename = '{}.zip'.format(config.get('title', 'temp'))
    APP.logger.info('Start archive page.')
    config['is_pack'] = True

    with ZipFile(f, 'w', allowZip64=True) as zipfile:

        # Pack images.
        images = config.get('images')
        if not images:
            abort(404)
        total = len(images)

        def _write_image(image):
            assert isinstance(image, HTMLImage)
            for role, dirname in image.folder_names.items():
                try:
                    generated = image.generate(role)
                    zipfile.write(text_type(generated),
                                  '{}/{}'.format(dirname, generated.name))
                except (OSError, KeyError):
                    pass

        for index, i in enumerate(images, 1):
            job = spawn(_write_image, i)
            while not job.ready():
                sleep(0.1)
            pack_progress(index * 100.0 / total)

        # Pack static files:
        for i in config.get('static', ()):
            zipfile.write(APP.static_folder + '/' + i, 'static/{}'.format(i))

        # Pack index.
        index_page = render_template('csheet.html', **config)
        zipfile.writestr('{}.html'.format(
            config.get('title', 'index')), index_page.encode('utf-8'))

    f.seek(0, SEEK_END)
    size = f.tell()
    f.seek(0)
    resp = send_file(f, as_attachment=True, attachment_filename=filename.encode('utf-8'),
                     add_etags=False)
    resp.headers.extend({
        'Content-Length': size,
        'Cache-Control': 'no-cache'
    })
    pack_progress(-1)
    return resp


@APP.route('/project_code/<project>')
def get_project_code(project):
    """Get proejct code for @project.  """

    try:
        return cgtwq.PROJECT.filter(cgtwq.Filter('full_name', project))['code'][0]
    except IndexError:
        u_abort(404, 'No such project.')
