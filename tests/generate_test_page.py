# -*- coding=UTF-8 -*-
"""Generate templates for webpack dev server.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from requests.utils import quote

import util
from csheet.views import APP


def main():

    client = APP.test_client()
    client.post('/_login')
    for page, filename in [
            ('/login', 'login.html'),
            ('/', 'index.html'),
            (quote(b'/?pipeline=合成&project=梦塔&prefix=MT_EP06_01_',
                   safe=b'/?=&'), 'csheet.html')
    ]:
        resp = client.get(page)
        with open(util.path('pages', filename), 'w') as f:
            f.write(resp.data)


if __name__ == '__main__':
    main()
