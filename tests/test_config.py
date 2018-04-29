# -*- coding=UTF-8 -*-
"""Test module `config`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import cgtwq

from csheet import config, video
from util import skip_if_not_logged_in


@skip_if_not_logged_in
def test_cgteamwork():
    cfg = config.CGTeamWorkConfig(
        '梦塔', '合成', 'MT_EP07_05', cgtwq.DesktopClient.token())
    cfg.sync()
    videos = cfg.videos()
    assert isinstance(videos, list)
    assert videos
    assert len(videos) == 102


def test_local():
    cfg = config.LocalConfig('D:/Users/34357/Pictures/Collection')
    cfg.update()
    videos = cfg.videos()
    assert isinstance(videos, list)
    for i in videos:
        assert isinstance(i, video.HTMLVideo)
        print(i.get('full'))
