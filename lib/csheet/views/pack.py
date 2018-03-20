# -*- coding=UTF-8 -*-
"""Pack csheet to zip file.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from os import SEEK_END
from tempfile import TemporaryFile
from zipfile import ZipFile

from gevent import sleep, spawn
from gevent.queue import Queue
from six import text_type

from flask import Response, abort, render_template, request, send_file

from ..html import HTMLImage, updated_config
from .app import APP


STATUS = {}
PROGRESS_EVENT_LISTENER = []


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
    """Return pack event.  """

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
