# -*- coding=UTF-8 -*-
"""Generate templates for webpack dev server.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from requests.utils import quote

import cgtwq
import util
from csheet.views import APP
import csheet


def _inject_text(js_file):
    return '<script type="text/javascript" src="{}"></script>'.format(js_file)


def main():
    tasks = [
        ('/', 'index.html', _inject_text('/index.js')),
        ('/local?root=D%3A%5CUsers%5C34357%5CPictures%5CCollection',
         'local.html', _inject_text('/csheet.js'))
    ]

    original_root_path = APP.root_path
    original_tempaltes_folder = csheet.page.core.BasePage.templates_folder
    APP.root_path = util.path('../public')
    csheet.page.core.BasePage.templates_folder = util.path(
        '../public/templates')
    client = APP.test_client()
    if cgtwq.DesktopClient.is_logged_in():
        tasks.append((quote(b'/?pipeline=合成&project=梦塔&prefix=MT_EP06_',
                            safe=b'/?=&'), 'csheet.html', _inject_text('/csheet.js')))
        client.post('/_login')
    else:
        print('CGTeamWork not logged in')

    for page, filename, inject_text in tasks:
        resp = client.get(page)
        with open(util.path('pages', filename), 'w') as f:
            f.write(resp.data)
            f.write(inject_text)

    csheet.page.core.BasePage.templates_folder = original_tempaltes_folder
    APP.root_path = original_root_path


if __name__ == '__main__':
    main()
