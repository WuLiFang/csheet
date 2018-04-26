# -*- coding=UTF-8 -*-
"""Test module `views.pack`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import cgtwq
from csheet import config
from csheet.views import pack
from util import skip_if_not_logged_in
import util
from wlf.path import get_encoded as e

import pytest


@pytest.mark.skip('TODO')
@skip_if_not_logged_in
def test_pack():
    util.setup()
    cfg = config.CGTeamWorkConfig(
        '梦塔', '合成', 'MT_EP06_03', cgtwq.DesktopClient.token())
    cfg.sync()
    file_ = pack.archive(cfg)
    with open(e(util.path('storage', 'packed.zip')), 'wb') as f:
        f.write(file_.read())

    raise RuntimeError
