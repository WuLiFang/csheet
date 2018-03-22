# -*- coding=UTF-8 -*-
"""Test `csheet.view` module.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import re
from unittest import TestCase, main, skip

import flask
from requests.utils import quote

from csheet.views import APP
from util import skip_if_not_logged_in
from wlf.cgtwq import CGTeamWorkClient


@APP.route('/_login', methods=('POST',))
def _login():
    flask.session['token'] = CGTeamWorkClient.token()
    return 'Logged in'


APP.testing = True


class ViewTestCase(TestCase):
    def setUp(self):
        self.app = APP.test_client()

    @skip('TODO')
    def test_main(self):
        recv = self.app.get('/')
        if CGTeamWorkClient.is_logged_in():
            self.assertEqual(recv.status_code, 200)
        else:
            self.assertEqual(recv.status_code, 503)


@skip_if_not_logged_in
class CGTeamworkTestCase(TestCase):

    def setUp(self):
        self.client = APP.test_client()
        recv = self.client.post('_login')
        # To initiate images
        url = quote(
            b'/?pipeline=合成&project=梦塔&prefix=MT_EP06_01_', safe=b'/?=&')
        recv = self.client.get(url)
        self.assertEqual(recv.status_code, 200)
        self.uuid_list = re.findall('data-uuid="(.+)"', recv.data)
        self.assert_(self.uuid_list)

    def test_image_info(self):
        for i in self.uuid_list:
            url = '/images/{}.info'.format(i)
            recv = self.client.get(url)
            self.assertEqual(recv.status_code, 200)

    def test_image_note(self):
        for i in self.uuid_list:
            url = b'/images/{}.notes/合成'.format(i)
            recv = self.client.get(quote(url))
            self.assertEqual(recv.status_code, 200)

    def test_get_image(self):
        for role in ('thumb', 'preview', 'full'):
            for i in self.uuid_list:
                url = b'/images/{}.{}'.format(i, role)
                recv = self.client.get(quote(url))
                self.assertIn(
                    recv.status_code,
                    (200, 503),
                    '{}: {}'.format(url, _recv_msg(recv)))

    def test_api(self):
        result = self.client.get('/api/list_images/梦塔/合成/MT_EP06_01')
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.content_type, 'application/json')


def _recv_msg(recv):
    if recv.content_type.startswith('text/'):
        return recv.data
    return recv.content_type


if __name__ == '__main__':
    main()
