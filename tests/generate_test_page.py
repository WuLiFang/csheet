# -*- coding=UTF-8 -*-
"""Generate templates for webpack dev server.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from requests.utils import quote

import cgtwq
import util
from csheet.views import APP


def main():
    tasks = [
        ('/login', 'login.html'),
        ('/', 'index.html'),
        ('/local?root=D%3A%5CUsers%5C34357%5CPictures%5CCollection', 'local.html')
    ]
    client = APP.test_client()
    if cgtwq.DesktopClient.is_logged_in():
        tasks.append((quote(b'/?pipeline=合成&project=梦塔&prefix=MT_EP06_07_',
                            safe=b'/?=&'), 'csheet.html'))
        client.post('/_login')
    else:
        print('CGTeamWork not logged in')

    for page, filename in tasks:
        resp = client.get(page)
        with open(util.path('pages', filename), 'w') as f:
            f.write(resp.data)


if __name__ == '__main__':
    main()
