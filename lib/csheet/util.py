# -*- coding=UTF-8 -*-
"""Csheet utility.  """
import sys
import locale


def set_locale():
    """Set locale according default locale.
    """

    language_code, _ = locale.getdefaultlocale()
    if sys.platform == 'win32':
        locale_ = {'zh_CN': 'chinese'}.get(language_code)
        if locale_:
            locale.setlocale(locale.LC_ALL, locale_)
