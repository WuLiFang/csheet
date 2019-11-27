
from datetime import datetime
from csheet.page import tasks

import os
from tests import util


def test_touch_files():
    poster = util.path('images', 'gray.png')
    now = datetime.now().timestamp()
    assert os.path.getatime(poster) < now
    tasks.touch_files([poster])
    assert os.path.getatime(poster) > now
