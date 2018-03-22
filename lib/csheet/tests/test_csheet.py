# -*- coding=UTF-8 -*-
"""Contactsheet test.  """
from __future__ import absolute_import, print_function, unicode_literals

import pickle
import sys
from tempfile import mktemp
from unittest import TestCase, main, skip

from six.moves import range

from csheet.image import HTMLImage
from wlf.path import PurePath


class CSheetTestCase(TestCase):
    def setUp(self):
        self.dummy_list = (['e:/test/EP_test_sc999_abc.png', 'e:/test2/EP_test_sc999_abc.png',
                            'e:/中文路径', 'e:/测试/中文路径']
                           + [mktemp() for _ in range(20)])

    def test_from_list(self):
        from csheet.image import from_list
        from_list(self.dummy_list)

    def test_preview_default(self):
        if sys.platform == 'win32':
            src = 'c:/test/case1.jpg'
            expected = 'c:/test/previews/case1.mp4'
        else:
            src = '/mnt/c/test/case1.jpg'
            expected = '/mnt/c/test/previews/case1.mp4'
        image = HTMLImage(src)
        self.assertEqual(image.get_default('preview'),
                         PurePath(expected))

    def test_pickle_image(self):
        from csheet.image import Image

        image_b = Image('temp')
        data = pickle.dumps(image_b, pickle.HIGHEST_PROTOCOL)
        image_a = pickle.loads(data)
        self.assertIsInstance(image_a, Image)
        self.assertEqual(image_a, image_b)

    @skip('TODO')
    def test_pickle_htmlimage(self):

        image_b = HTMLImage('temp')
        image_b.preview_source = 'hahaha'
        data = pickle.dumps(image_b, pickle.HIGHEST_PROTOCOL)
        image_a = pickle.loads(data)
        self.assertIsInstance(image_a, HTMLImage)
        self.assertEqual(image_a, image_b)


if __name__ == '__main__':
    main()
