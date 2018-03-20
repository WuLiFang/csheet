# -*- coding=UTF-8 -*-
"""Main csheet page.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import abort, make_response, redirect, render_template, request

from wlf import cgtwq
from wlf.path import Path

from . import pack
from ..database import get_csheet_config
from ..exceptions import u_abort
from ..html import from_dir, get_images_from_dir
from .app import APP


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
            return pack.packed_page(**config)

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
        return pack.packed_page(images=get_images_from_dir(local_dir))

    return from_dir(local_dir, is_client=True, relative_to=local_dir)
