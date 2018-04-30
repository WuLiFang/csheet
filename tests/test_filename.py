# -*- coding=UTF-8 -*-
"""Test module `filename`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from csheet import filename


def test_filter_filename():
    test_case = {
        'Z:/abc': '/z/abc',
        'Z:\\abc': '/z/abc',
        'z:\\abc': '/z/abc',
        'X:/abc/2': '/x/abc/2',
        'X:/abc\\2\\3': '/x/abc/2/3',
    }
    for input_, expected in test_case.items():
        result = filename.filter_filename(input_, 'linux')
        assert result == expected
    test_case = {
        '/z/abc': 'Z:\\abc',
        '/x/abc/2': 'X:\\abc\\2',
        '/x/abc/2/3': 'X:\\abc\\2\\3',
    }
    for input_, expected in test_case.items():
        result = filename.filter_filename(input_, 'win32')
        assert result == expected