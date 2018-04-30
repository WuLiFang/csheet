# -*- coding=UTF-8 -*-
"""Test module `config`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import cgtwq

import util
from csheet import page, video
from wlf.path import get_encoded as e


@util.skip_if_not_logged_in
def test_cgteamwork():
    cfg = page.CGTeamWorkPage(
        '梦塔', '合成', 'MT_EP07_05', cgtwq.DesktopClient.token())
    cfg.sync()
    videos = cfg.videos()
    assert isinstance(videos, list)
    assert videos
    assert len(videos) == 102


def test_local():
    cfg = page.LocalPage('D:/Users/34357/Pictures/Collection')
    cfg.update()
    videos = cfg.videos()
    assert isinstance(videos, list)
    for i in videos:
        assert isinstance(i, video.HTMLVideo)
        print(i.get('full'))


@util.skip_if_not_logged_in
def test_pack():
    util.setup()
    cfg = page.CGTeamWorkPage(
        '梦塔', '合成', 'MT_EP06_03', cgtwq.DesktopClient.token())
    cfg.sync()
    file_ = cfg.archive()
    with open(e(util.path('storage', 'packed.zip')), 'wb') as f:
        f.write(file_.read())

    raise RuntimeError
