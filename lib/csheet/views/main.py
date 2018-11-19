# -*- coding=UTF-8 -*-
"""Main csheet page.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import os

from flask import make_response, render_template, request, send_file, session

import cgtwq
from wlf.decorators import run_with_clock

from . import core
from ..core import APP
from ..page import CGTeamWorkPage, LocalPage
from .login import require_login


@APP.route('/')
def render_main():
    """main page.  """

    if not request.args:
        return render_index()
    return render_csheet_page()


@run_with_clock('生成色板页面')
@require_login
def render_csheet_page():
    """Csheet page.  """

    project = request.args['project']
    prefix = request.args['prefix']
    pipeline = request.args['pipeline']
    token = session['token']
    page = CGTeamWorkPage(project, pipeline, prefix, token)
    page.update_async()

    sess = core.database_session()
    if 'pack' in request.args:
        return packed_page(page, sess)
    rendered = page.render(
        page.videos(sess),
        template='main_app.html',
        request=request,
        session=session,
        database_session=sess)

    # Respon with cookies set.
    resp = make_response(rendered)
    resp.set_cookie('project', project, max_age=APP.config['COOKIE_LIFE'])
    resp.set_cookie('pipeline', pipeline, max_age=APP.config['COOKIE_LIFE'])
    resp.set_cookie('prefix', prefix, max_age=APP.config['COOKIE_LIFE'])

    return resp


@require_login
def render_index():
    """Index page."""

    projects = []
    if not APP.config['LOCAL_MODE']:
        token = session['token']
        cgtwq.PROJECT.token = token
        projects = [{'code': i[0], 'name':i[1]}
                    for i in cgtwq.PROJECT.all().get_fields('code', 'full_name')]

    return render_template(
        'index.html',
        projects=projects,
        dumps=json.dumps)


@APP.route('/local')
def render_local_dir():
    """Render page for local dir.  """

    root = request.args['root']
    page = LocalPage(root)
    sess = core.database_session()
    page.update_async()

    if 'pack' in request.args:
        return packed_page(page, sess)

    videos = page.videos(sess)
    rendered = page.render(videos, 'main_app.html',
                           request=request, tags=page.tags(sess))

    resp = make_response(rendered)
    resp.set_cookie('root', root, max_age=APP.config['COOKIE_LIFE'])
    return resp


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
