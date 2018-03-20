# -*- coding=UTF-8 -*-
"""Test `csheet.view` module.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import re
from unittest import TestCase, main, skip

from csheet.views import APP
from requests.utils import quote
from util import skip_if_not_logged_in
from wlf.cgtwq import CGTeamWorkClient

APP.testing = True


class ViewTestCase(TestCase):
    def setUp(self):
        self.app = APP.test_client()

    @skip
    def test_main(self):
        recv = self.app.get('/')
        if CGTeamWorkClient.is_logged_in():
            self.assertEqual(recv.status_code, 200)
        else:
            self.assertEqual(recv.status_code, 503)


@skip_if_not_logged_in
class CGTeamworkTestCase(TestCase):
    def setUp(self):
        self.app = APP.test_client()
        # To initiate images
        url = quote(
            b'/?pipeline=合成&project=梦塔&prefix=MT_EP06_01_', safe=b'/?=&')
        recv = self.app.get(url)
        self.assertEqual(recv.status_code, 200)
        self.uuid_list = re.findall('data-uuid="(.+)"', recv.data)
        self.assert_(self.uuid_list)

    def test_image_info(self):
        for i in self.uuid_list:
            url = '/images/{}.info'.format(i)
            recv = self.app.get(url)
            self.assertEqual(recv.status_code, 200)

    def test_image_note(self):
        for i in self.uuid_list:
            url = b'/images/{}.notes/合成'.format(i)
            recv = self.app.get(quote(url))
            self.assertEqual(recv.status_code, 200)


if __name__ == '__main__':
    main()
