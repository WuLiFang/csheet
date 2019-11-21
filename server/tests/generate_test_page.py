# -*- coding=UTF-8 -*-
"""Generate templates for webpack dev server.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import typing
from urllib.parse import quote

from tests import util

import cgtwq
import csheet

if typing.TYPE_CHECKING:
    import werkzeug


def _inject_text(js_file):
    return '<script type="text/javascript" src="{}"></script>'.format(js_file)


def main():
    tasks = [
        ('/', 'index.html', _inject_text('/index.js')),
        (f"/?root={quote(util.path('storage', 'local'))}",
         'local.html', _inject_text('/main.js'))
    ]

    original_root_path = csheet.APP.root_path
    csheet.APP.root_path = util.path('../../web/public')
    client = csheet.APP.test_client()
    if cgtwq.DesktopClient().is_logged_in():
        tasks.append((quote('/?pipeline=合成&prefix=MT2_EP00&project=梦塔第二季',
                            safe=b'/?=&'), 'main.html', _inject_text('/main.js')))
        client.post('/_login')
    else:
        print('CGTeamWork not logged in')

    for page, filename, inject_text in tasks:
        resp = client.get(page)  # type: werkzeug.wrappers.Response
        with open(util.path('pages', filename), 'w', encoding='utf-8') as f:
            f.write(str(resp.data, 'utf-8'))
            f.write(inject_text)

    csheet.APP.root_path = original_root_path


if __name__ == '__main__':
    util.setup()
    main()
