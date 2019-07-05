# -*- coding=UTF-8 -*-
"""Test module `filecache`.  """

import os
from datetime import datetime, timedelta

from tests import util

from csheet import filecache


def test_filepath():
    assert (
        filecache.get_pathname(util.path('images/gray.png')) ==
        'cache/c5/3c/fb6d7c629971d11979127f7bf9adaa33ff7e4102b5ec2efb088e6fc5c45a/gray.png')


def test_save():
    dst = util.path(
        'storage/cache/c5/3c/fb6d7c629971d11979127f7bf9adaa33ff7e4102b5ec2efb088e6fc5c45a/gray.png')
    try:
        os.remove(dst)
    except OSError:
        pass
    assert not os.path.exists(dst)
    assert (
        filecache.save(util.path('images/gray.png')) ==
        'cache/c5/3c/fb6d7c629971d11979127f7bf9adaa33ff7e4102b5ec2efb088e6fc5c45a/gray.png')

    assert os.path.exists(dst)


def test_prune():
    now = datetime.now()
    old_time: datetime = now - timedelta(days=31)
    oldfolder = util.path('storage/cache/oldfolder')
    oldfolder_file = os.path.join(oldfolder, 'file')
    os.makedirs(oldfolder, exist_ok=True)
    with open(oldfolder_file, 'w'):
        os.utime(oldfolder_file, (old_time.timestamp(), now.timestamp()))
    oldfile = util.path('storage/cache/oldfile')
    with open(oldfile, 'w'):
        os.utime(oldfile, (old_time.timestamp(), now.timestamp()))
    newfolder = util.path('storage/cache/newfolder')
    newfolder_file = os.path.join(newfolder, 'file')
    os.makedirs(newfolder, exist_ok=True)
    with open(newfolder_file, 'w'):
        os.utime(newfolder_file, None)
    newfile = util.path('storage/cache/newfile')
    with open(newfile, 'w'):
        os.utime(newfile, None)
    emptyfolder = util.path('storage/cache/emptyfolder')
    os.makedirs(emptyfolder, exist_ok=True)

    assert os.path.exists(oldfolder)
    assert os.path.exists(oldfolder_file)
    assert os.path.exists(oldfile)
    assert os.path.exists(newfolder)
    assert os.path.exists(newfolder_file)
    assert os.path.exists(newfile)
    assert os.path.exists(emptyfolder)

    result = filecache.prune()
    assert not os.path.exists(oldfolder)
    assert not os.path.exists(oldfolder_file)
    assert not os.path.exists(oldfile)
    assert os.path.exists(newfolder)
    assert os.path.exists(newfolder_file)
    assert os.path.exists(newfile)
    assert not os.path.exists(emptyfolder)
    assert len(result) > 3
    assert oldfile in result
    assert oldfolder in result
    assert oldfolder_file in result
    assert emptyfolder in result
