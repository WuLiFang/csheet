# -*- coding=UTF-8 -*-
"""Test module `filepath`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import sys

from tests import util

from csheet import filepath


def test_translate():
    test_case = {
        'Z:/abc': '/z/abc',
        'Z:\\abc': '/z/abc',
        'z:\\abc': '/z/abc',
        'X:/abc/2': '/x/abc/2',
        'X:/abc\\2\\3': '/x/abc/2/3',
    }
    for input_, expected in list(test_case.items()):
        result = filepath.translate(input_, 'linux')
        assert result == expected
    test_case = {
        '/z/abc': 'Z:\\abc',
        '/x/abc/2': 'X:\\abc\\2',
        '/x/abc/2/3': 'X:\\abc\\2\\3',
    }
    for input_, expected in list(test_case.items()):
        result = filepath.translate(input_, 'win32')
        assert result == expected


def test_normalize():
    cases = []
    if sys.platform == 'win32':
        cases.extend([
            ('/z/abc', 'Z:\\abc'),
            ('/x/abc/2', 'X:\\abc\\2'),
            ('/x/abc/2/3', 'X:\\abc\\2\\3'),
            ('abc/2/3', util.path('storage', 'abc', '2', '3')),
        ])
    else:
        cases.extend([
            ('Z:/abc', '/z/abc'),
            ('Z:\\abc', '/z/abc'),
            ('z:\\abc', '/z/abc'),
            ('X:/abc/2', '/x/abc/2'),
            ('X:/abc\\2\\3', '/x/abc/2/3'),
            ('abc/2/3', util.path('storage', 'abc', '2', '3')),
        ])
    for i, expected in cases:
        result = filepath.normalize(i)
        assert result == expected, i
