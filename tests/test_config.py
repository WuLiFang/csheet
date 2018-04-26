# -*- coding=UTF-8 -*-
"""Test module `config`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from csheet import config
from util import skip_if_not_logged_in
import cgtwq


@skip_if_not_logged_in
def test_cgteamwork():
    cfg = config.CGTeamWorkConfig(
        '梦塔', '合成', 'MT_EP07_05', cgtwq.DesktopClient.token())
    cfg.sync()
    videos = cfg.videos()
    assert isinstance(videos, list)
    assert videos
    assert len(videos) == 102
