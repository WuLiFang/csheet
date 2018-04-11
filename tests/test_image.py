# -*- coding=UTF-8 -*-
"""Test module `html`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from unittest import TestCase, main

import six

from csheet.image import HTMLImage
import util


class HTMLImageTestCase(TestCase):
    def setUp(self):
        self.image = HTMLImage(util.path('images', 'gray.png'))

    def test_generate(self):
        self.image.generate('thumb')
        self.image.generate('full')
        self.assertRaises(
            KeyError, self.image.generate,
            'preview'
        )
        self.image.generate('preview', is_strict=False)

    def test_get_source(self):
        result = self.image.get_source('thumb')
        self.assertIsInstance(result, six.text_type)
        self.assertRaises(
            KeyError, self.image.get_source,
            'preview', True)


if __name__ == '__main__':
    main()
