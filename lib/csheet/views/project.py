# -*- coding=UTF-8 -*-
"""Get project info.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from wlf import cgtwq

from ..exceptions import u_abort
from .app import APP


@APP.route('/project_code/<project>')
def get_project_code(project):
    """Get proejct code for @project.  """

    try:
        return cgtwq.PROJECT.filter(cgtwq.Filter('full_name', project))['code'][0]
    except IndexError:
        u_abort(404, 'No such project.')
