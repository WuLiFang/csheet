# -*- coding=UTF-8 -*-
"""Main csheet page.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os

from flask import make_response, render_template, request, send_file, session

import cgtwq

from . import core
from ..__about__ import __version__
from ..page import CGTeamWorkPage, LocalPage
from .app import APP
from .util import require_login


@APP.route('/')
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
    page = CGTeamWorkPage(project, pipeline, prefix, token)

    with core.database_session() as sess:
        if 'pack' in args:
            return packed_page(page, sess)
        page.update_later(sess)
        rendered = page.render(
            page.videos(sess),
            template='csheet_app.html',
            request=request)

    # Respon with cookies set.
    resp = make_response(rendered)
    cookie_life = 60 * 60 * 24 * 90
    resp.set_cookie('project', project, max_age=cookie_life)
    resp.set_cookie('pipeline', pipeline, max_age=cookie_life)
    resp.set_cookie('prefix', prefix, max_age=cookie_life)

    return resp


@APP.route('/local')
def render_local_dir():
    """Render page for local dir.  """

    root = request.args['root']
    page = LocalPage(root)
    with core.database_session() as sess:
        page.update_later(sess)

        if 'pack' in request.args:
            return packed_page(page, sess)

        return page.render(page.videos(sess), 'csheet_app.html', request=request)


def packed_page(page, database_session):
    """Return zip packed offline version.  """

    f = page.archive(database_session)
    f.seek(0, os.SEEK_END)
    size = f.tell()
    f.seek(0)
    filename = '{}.zip'.format(page.title)

    resp = send_file(f, as_attachment=True,
                     attachment_filename=filename,
                     add_etags=False)
    resp.headers.extend({
        'Content-Length': size,
        'Cache-Control': 'no-cache'
    })
    return resp
