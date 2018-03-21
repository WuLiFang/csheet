# -*- coding=UTF-8 -*-
"""Test module `filename`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from unittest import TestCase, main

from csheet import filename


class UtilTestCase(TestCase):
    def test_filter_filename(self):
        test_case = {
            'Z:/abc': '/z/abc',
            'Z:\\abc': '/z/abc',
            'z:\\abc': '/z/abc',
            'X:/abc/2': '/x/abc/2',
            'X:/abc\\2\\3': '/x/abc/2/3',
        }
        for input_, expected in test_case.items():
            result = filename.filter_filename(input_, 'linux')
            self.assertEqual(result, expected)


if __name__ == '__main__':
    main()
