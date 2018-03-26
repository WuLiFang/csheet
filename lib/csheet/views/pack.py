# -*- coding=UTF-8 -*-
"""Pack csheet to zip file.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
from os import SEEK_END
from tempfile import TemporaryFile
from zipfile import ZipFile

from flask import Response, abort, render_template, request, send_file
from gevent import sleep, spawn
from gevent.queue import Queue
from six import text_type

from ..image import HTMLImage
from .app import APP
from .image import _get_gen_image
from ..page import updated_config

STATUS = {}
PROGRESS_EVENT_LISTENER = []

LOGGER = logging.getLogger(__name__)


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
    """Return zip packed offline version.  """

    if float(pack_progress()) != -1:
        abort(429)
    try:
        LOGGER.info('Start pack.')
        f = archive(**config)
    except:
        LOGGER.error('Error during pack page.', exc_info=True)
        raise
    finally:
        pack_progress(-1)

    f.seek(0, SEEK_END)
    size = f.tell()
    f.seek(0)
    filename = '{}.zip'.format(config.get('title', 'temp'))

    resp = send_file(f, as_attachment=True,
                     attachment_filename=filename.encode('utf-8'),
                     add_etags=False)
    resp.headers.extend({
        'Content-Length': size,
        'Cache-Control': 'no-cache'
    })
    return resp


def archive(**config):
    """Return zip packed offline version.  """

    config = updated_config(config)
    pack_progress(0)

    f = TemporaryFile(suffix='.zip',
                      prefix=config.get('title', 'packing_csheet_'),
                      dir=APP.config.get('storage'))
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
            for role in image.generate_methods:
                try:
                    generated = _get_gen_image(image.uuid, role)
                except(KeyError, ValueError):
                    continue
                except:
                    LOGGER.error(
                        'Unexpect exception during generate: %s: %s', image, role, exc_info=True)
                    raise
                arcname = image.get(role, is_pack=True)
                zipfile.write(text_type(generated), arcname)

        for index, i in enumerate(images, 1):
            job = spawn(_write_image, i)
            while not job.ready():
                sleep(0.1)
            pack_progress(index * 100.0 / total)

        # Pack static files:
        for i in config.get('static', ()):
            zipfile.write(APP.static_folder + '/' + i,
                          '{}/{}'.format(config['static_folder'], i))

        # Pack index.
        index_page = render_template('csheet.html', **config)
        zipfile.writestr('{}.html'.format(
            config.get('title', 'index')), index_page.encode('utf-8'))

    return f
