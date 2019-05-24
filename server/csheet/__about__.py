# -*- coding=UTF-8 -*-
"""Csheet (Contactsheet and Colorsheet) package.   """
import json
import os

__folder__ = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(os.path.dirname(os.path.dirname(__folder__)), 'package.json')) as f:
    __version__ = json.load(f)['version']
__author__ = 'NateScarlet@Gmail.com'
