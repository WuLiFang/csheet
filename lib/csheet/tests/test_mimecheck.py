# -*- coding=UTF-8 -*-
"""Test `csheet.mimecheck` module.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from unittest import TestCase, main

from csheet import mimecheck


class MimeCheckTestCase(TestCase):
    def test_same_mimetype(self):
        result = mimecheck.same_mimetype('.jpg', '.png')
        self.assertFalse(result)
        result = mimecheck.same_mimetype('.jpg', '.jpeg')
        self.assert_(result)

    def test_is_mimetype(self):
        result = mimecheck.is_mimetype('test.jpg', 'image')
        self.assert_(result)
        result = mimecheck.is_mimetype('test.mp3', 'image')
        self.assertFalse(result)
        result = mimecheck.is_mimetype('test.mp3', 'audio')
        self.assert_(result)
        result = mimecheck.is_mimetype('test.mov', 'video')
        self.assert_(result)
        result = mimecheck.is_mimetype('test.txt', ('video', 'text'))
        self.assert_(result)


if __name__ == '__main__':
    main()
