# -*- coding=UTF-8 -*-
"""Test `csheet.view` module.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import re
from unittest import TestCase, main, skip

import flask
from cgtwq import DesktopClient
from requests.utils import quote

from csheet.views import APP
from util import skip_if_not_logged_in


class ViewTestCase(TestCase):
    def setUp(self):
        self.app = APP.test_client()

    @skip('TODO')
    def test_main(self):
        recv = self.app.get('/')
        if DesktopClient.is_logged_in():
            self.assertEqual(recv.status_code, 200)
        else:
            self.assertEqual(recv.status_code, 503)


@skip_if_not_logged_in
class CGTeamworkTestCase(TestCase):

    def setUp(self):
        self.client = APP.test_client()
        # recv = self.client.post('/_login')
        recv = self.client.post(
            '/login', data={'account': 'lubo', 'password': ''})
        # To initiate images
        url = quote(
            b'/?pipeline=合成&project=梦塔&prefix=MT_EP06_01_', safe=b'/?=&')
        recv = self.client.get(url)
        self.assertEqual(recv.status_code, 200)
        self.uuid_list = re.findall('data-uuid="(.+)"', recv.data)
        self.assert_(self.uuid_list)

    def test_database_field(self):
        for i in self.uuid_list:
            url = (b'/api/image/field'
                   b'?field=test&pipeline=合成&uuid={}').format(i)
            result = self.client.get(url)
            self.assertEqual(result.status_code, 200)
            self.assertEqual(result.content_type, 'application/json')
            self.client.put(url, data={'data': '3'})


def _recv_msg(recv):
    if recv.content_type.startswith('text/'):
        return recv.data
    return recv.content_type


if __name__ == '__main__':
    main()
