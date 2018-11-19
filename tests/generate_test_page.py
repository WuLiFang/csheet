# -*- coding=UTF-8 -*-
"""Generate templates for webpack dev server.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import typing

from requests.utils import quote

import cgtwq
import csheet
import util

if typing.TYPE_CHECKING:
    import werkzeug


def _inject_text(js_file):
    return '<script type="text/javascript" src="{}"></script>'.format(js_file)


def main():
    tasks = [
        ('/', 'index.html', _inject_text('/index.js')),
        ('/?root=D%3A%5CUsers%5C34357%5CPictures%5CCollection',
         'local.html', _inject_text('/csheet.js'))
    ]

    original_root_path = csheet.APP.root_path
    original_tempaltes_folder = csheet.page.core.BasePage.templates_folder
    csheet.APP.root_path = util.path('../public')
    csheet.page.core.BasePage.templates_folder = util.path(
        '../public/templates')
    client = csheet.APP.test_client()
    if cgtwq.DesktopClient().is_logged_in():
        tasks.append((quote('/?pipeline=合成&project=梦塔&prefix=MT_EP06_',
                            safe=b'/?=&'), 'main.html', _inject_text('/main.js')))
        client.post('/_login')
    else:
        print('CGTeamWork not logged in')

    for page, filename, inject_text in tasks:
        resp = client.get(page)  # type: werkzeug.wrappers.Response
        with open(util.path('pages', filename), 'w', encoding='utf-8') as f:
            f.write(str(resp.data, 'utf-8'))
            f.write(inject_text)

    csheet.page.core.BasePage.templates_folder = original_tempaltes_folder
    csheet.APP.root_path = original_root_path


if __name__ == '__main__':
    util.setup()
    main()
