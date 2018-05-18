# -*- coding=UTF-8 -*-
"""Cgteamwork data model.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from collections import namedtuple


class TaskInfo(namedtuple(
        'TaskInfo',
        ('pipeline', 'artist', 'leader_status',
         'director_status', 'client_status', 'note_num', 'id'))):
    """Task information.  """

    def sort_key(self):
        """Key for list sort . """

        pipeline = self.pipeline
        return (
            pipeline == '输出',
            pipeline == '合成',
            pipeline == '渲染',
            pipeline == '灯光',
            pipeline == '特效',
            pipeline == '解算',
            pipeline == '动画',
            pipeline == 'Layout',
            pipeline
        )
