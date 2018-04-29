# -*- coding=UTF-8 -*-
"""Pack csheet to zip file.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
from os import SEEK_END
from tempfile import TemporaryFile
from zipfile import ZipFile

from flask import Response, abort, render_template, request, send_file
from gevent.queue import Queue

from wlf.path import get_encoded as e
from wlf.path import PurePath

from ..config import BaseConfig
from ..filename import filter_filename
from ..video import HTMLVideo
from .app import APP

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
        def _events():
            queue = Queue()
            PROGRESS_EVENT_LISTENER.append(queue)
            try:
                while True:
                    yield _sse(queue.get())
            except GeneratorExit:
                PROGRESS_EVENT_LISTENER.remove(queue)

        return Response(_events(), content_type='text/event-stream')
    return pack_progress()


def packed_page(config):
    """Return zip packed offline version.  """
    assert isinstance(config, BaseConfig), type(config)
    if float(pack_progress()) != -1:
        abort(429)
    try:
        LOGGER.info('Start pack.')
        f = archive(config)
    except:
        LOGGER.error('Error during pack page.', exc_info=True)
        raise
    finally:
        pack_progress(-1)

    f.seek(0, SEEK_END)
    size = f.tell()
    f.seek(0)
    filename = '{}.zip'.format(config.title)

    resp = send_file(f, as_attachment=True,
                     attachment_filename=filename.encode('utf-8'),
                     add_etags=False)
    resp.headers.extend({
        'Content-Length': size,
        'Cache-Control': 'no-cache'
    })
    return resp


def archive(config):
    """Return zip packed offline version.  """
    assert isinstance(config, BaseConfig), type(config)

    f = TemporaryFile(suffix='.zip',
                      prefix=config.title)
    APP.logger.info('Start archive page.')
    config.is_pack = True

    with ZipFile(f, 'w', allowZip64=True) as zipfile:

        # Pack images.
        videos = config.videos()
        if not videos:
            abort(404)

        for video in videos:
            assert isinstance(video, HTMLVideo)
            data = {'full': video.poster,
                    'preview': video.preview,
                    'thumb': video.thumb}
            for role, filename in data.items():
                if not filename:
                    continue
                assert isinstance(filename, PurePath), type(filename)

                filename = filter_filename(filename)
                arcname = video.get(role, is_pack=True)
                try:
                    zipfile.write(e(filename), arcname.encode('utf-8'))
                    LOGGER.debug('Write zipfile: %s -> %s', filename, arcname)
                except OSError:
                    LOGGER.error('Error during pack', exc_info=True)

        # Pack static files:
        for i in config.static:
            zipfile.write(APP.static_folder + '/' + i,
                          '{}/{}'.format(config.static_folder, i))

        # Pack index.
        index_page = render_template('csheet.html', config=config)
        zipfile.writestr('{}.html'.format(config.title.replace('\\', '_')),
                         index_page.encode('utf-8'))
    f.seek(0)
    return f
