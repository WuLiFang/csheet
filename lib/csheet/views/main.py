# -*- coding=UTF-8 -*-
"""Main csheet page.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import abort, make_response, render_template, request, session
from gevent import spawn

import cgtwq
from wlf.path import Path

from . import pack
from ..__about__ import __version__
from ..config import CGTeamWorkConfig, LocalConfig
from ..image import get_images_from_dir
from ..page import from_dir
from .app import APP
from .util import require_login


@require_login
def render_main():
    """main page.  """

    token = session['token']
    args = request.args
    if not args:
        cgtwq.PROJECT.token = token
        return render_template(
            'index.html',
            projects=cgtwq.PROJECT.names(),
            __version__=__version__)

    project = args['project']
    prefix = args['prefix']
    pipeline = args['pipeline']
    token = session['token']
    config = CGTeamWorkConfig(project, pipeline, prefix, token)
    if 'pack' in args:
        return pack.packed_page(config)

    # Respon with cookies set.
    config.sync_with_thread()
    resp = make_response(render_template('csheet_app.html', config=config))
    cookie_life = 60 * 60 * 24 * 90
    resp.set_cookie('project', project, max_age=cookie_life)
    resp.set_cookie('pipeline', pipeline, max_age=cookie_life)
    resp.set_cookie('prefix', prefix, max_age=cookie_life)

    return resp


@APP.route('/local')
def render_local_dir():
    """Render page for local dir.  """

    root = request.args['root']
    config = LocalConfig(root)
    config.update()

    if 'pack' in request.args:
        return pack.packed_page(config)

    return render_template('csheet_app.html', config=config)
