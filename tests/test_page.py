# -*- coding=UTF-8 -*-
"""Test module `page`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import cgtwq

import util
from csheet import page, video, database
from wlf.path import get_encoded as e


@util.skip_if_not_logged_in
def test_cgteamwork():
    cfg = page.CGTeamWorkPage(
        '梦塔', '合成', 'MT_EP07_05', cgtwq.DesktopClient.token())
    with database.session_scope() as sess:
        cfg.update_later(sess)
        videos = cfg.videos(sess)
        tasks = cfg.tasks(sess)
    assert isinstance(videos, list)
    assert isinstance(tasks, list)
    assert videos
    assert len(videos) == 102
    assert len(tasks) == 730


def test_local():
    cfg = page.LocalPage('D:/Users/34357/Pictures/Collection')
    with database.session_scope() as sess:
        cfg.update_later(sess)
        videos = cfg.videos(sess)
    assert isinstance(videos, list)
    for i in videos:
        assert isinstance(i, video.HTMLVideo)
        print(i.get('full'))


@util.skip_if_not_logged_in
def test_pack():
    util.setup()
    cfg = page.CGTeamWorkPage(
        '梦塔', '合成', 'MT_EP06_03', cgtwq.DesktopClient.token())
    with database.session_scope() as sess:
        cfg.update_later(sess)
        file_ = cfg.archive(sess)
    with open(e(util.path('storage', 'packed.zip')), 'wb') as f:
        f.write(file_.read())
