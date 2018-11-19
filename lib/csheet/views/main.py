# -*- coding=UTF-8 -*-
"""Main csheet page.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os

from flask import make_response, render_template, request, send_file, session

import cgtwq
from wlf.decorators import run_with_clock

from . import core
from ..core import APP
from ..filters import dumps
from ..page import CGTeamWorkPage, LocalPage
from ..page.core import BasePage
from .login import require_login


@APP.route('/')
@APP.route('/api/page')
@APP.route('/api/page/')
@require_login
def render_main():
    """main page.  """

    if not request.args:
        return render_index()
    page: BasePage = get_page()
    sess = core.database_session()
    if 'pack' in request.args:
        return packed_page(page, sess)

    handler = {
        'application/json': lambda: _page_data(page, sess),
        'text/html': lambda: _render_page(page, sess),
    }
    mimetypes = request.accept_mimetypes
    best = mimetypes.best_match(handler.keys(), default='text/html')
    return handler[best]()


@run_with_clock('生成色板页面')
def _render_page(page: BasePage, database_session):
    """Csheet page.  """

    page.update_async()

    rendered = page.render(
        template='main_app.html',
        database_session=database_session)

    resp = make_response(rendered)
    for k, v in request.args.items():
        if k not in ('root', 'project', 'pipeline', 'prefix'):
            continue
        resp.set_cookie(k, v, max_age=APP.config['COOKIE_LIFE'])

    return resp


def _page_data(page: BasePage, database_session):

    data = page.data(database_session)
    resp = make_response(dumps(data))
    resp.headers['Content-Type'] = 'application/json; charset=utf-8'
    return resp


def get_page() -> BasePage:
    """Get page from request args.

    Returns:
        BasePage
    """

    kwargs: dict = request.args
    if 'root' in kwargs:
        page = LocalPage(kwargs['root'])
    else:
        page = CGTeamWorkPage(kwargs['project'],
                              kwargs['pipeline'],
                              kwargs['prefix'],
                              session['token'])
    return page


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
        projects=projects)


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
