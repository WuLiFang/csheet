# -*- coding=UTF-8 -*-
"""Pack csheet to zip file.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
from os import SEEK_END

from flask import Response, abort, request, send_file
from gevent.queue import Queue

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

    if float(pack_progress()) != -1:
        abort(429)
    try:
        LOGGER.info('Start pack.')
        f = config.archive()
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
                     attachment_filename=filename,
                     add_etags=False)
    resp.headers.extend({
        'Content-Length': size,
        'Cache-Control': 'no-cache'
    })
    return resp
