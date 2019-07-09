# -*- coding=UTF-8 -*-
"""Handle local file cache.  """

import datetime
import os
import shutil
from datetime import datetime, timedelta
from typing import List

from . import core, filetools


def get_pathname(path: str) -> str:
    """Get corresponding cache path relative to storage.

    Used in api.

    Args:
        path (str): File to cache

    Returns:
        str: Path
    """
    sha = filetools.sha256sum(path)

    return f'cache/{sha[0:2]}/{sha[2:4]}/{sha[4:]}/{os.path.basename(path)}'


def save(path: str, is_move: bool = False) -> str:
    """Save file to cache.

    Args:
        path (str): File paht
        is_move (bool, optional): Whether remove source file. Defaults to False.

    Returns:
        str: Cache pathname
    """
    store = core.APP.config['STORAGE']
    src = path
    pathname = get_pathname(src)
    dst = os.path.join(store, pathname)

    os.makedirs(os.path.dirname(dst), 0o755, exist_ok=True)

    (shutil.move if is_move else shutil.copy2)(src, os.path.join(store, dst))

    return pathname


@core.CELERY.task(ignore_result=True)
def prune(max_age=30) -> List[str]:
    now = datetime.now()
    removed: List[str] = []
    top = os.path.join(core.APP.config['STORAGE'], 'cache')
    for dirpath, dirnames, filenames in os.walk(top, False):
        keep_folder = len(dirnames) > 0
        for f in filenames:
            path = os.path.join(dirpath, f)
            atime = datetime.fromtimestamp(os.path.getatime(path))
            if now - atime > timedelta(days=max_age):
                os.remove(path)
                removed.append(path)
            else:
                keep_folder = True
        if not keep_folder:
            os.rmdir(dirpath)
            removed.append(dirpath)
    return removed


@core.CELERY.on_after_configure.connect
def setup_periodic_tasks(sender, **_):
    """Setup periodic tasks.  """

    one_day = 24 * 60 * 60
    sender.add_periodic_task(
        one_day,
        prune.s(max_age=core.APP.config['CACHE_LIFE']),
        expires=one_day)
