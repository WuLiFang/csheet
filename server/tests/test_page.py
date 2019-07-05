# -*- coding=UTF-8 -*-
"""Test module `page`.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from tests import util

import cgtwq
from csheet import APP, database, page, video
from wlf.path import get_encoded as e


@util.skip_if_not_logged_in
def test_cgteamwork():
    util.setup()
    cfg = page.CGTeamWorkPage(
        '梦塔', '合成', 'MT_EP07_05', cgtwq.DesktopClient().token())
    with database.session_scope() as sess:
        cfg.update_async()
        videos = cfg.videos(sess)
        tasks = cfg.tasks(sess)
    assert isinstance(videos, list)
    assert isinstance(tasks, list)
    assert videos
    assert len(videos) == 92
    assert len(tasks) == 738


@util.skip_if_not_logged_in
def test_cgteamwork_video():
    util.setup()
    cfg = page.CGTeamWorkPage(
        '开发测试用项目', '合成', 'SDKTEST_EP01_01_sc001', cgtwq.DesktopClient().token())
    with database.session_scope() as sess:
        cfg.update_async()
        videos = cfg.videos(sess)
        tasks = cfg.tasks(sess)
        assert videos[0].poster
    assert isinstance(videos, list)
    assert isinstance(tasks, list)
    assert len(videos) == 1
    assert len(tasks) == 10


def test_local():
    util.setup()
    cfg = page.LocalPage('D:/Users/34357/Pictures/Collection')
    with database.session_scope() as sess:
        cfg.update_async()
        videos = cfg.videos(sess)
    assert isinstance(videos, list)
    for i in videos:
        assert isinstance(i, video.HTMLVideo)
        print(i.get('full'))


@util.skip_if_not_logged_in
def test_pack():
    util.setup()
    cfg = page.CGTeamWorkPage(
        '梦塔', '合成', 'MT_EP06_03', cgtwq.DesktopClient().token())
    with database.session_scope() as sess,\
            APP.app_context(),\
            APP.test_request_context():
        cfg.update_async()
        file_ = cfg.archive(sess)
    with open(e(util.path('storage', 'packed.zip')), 'wb') as f:
        f.write(file_.read())
