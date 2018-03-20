# -*- coding=UTF-8 -*-
"""Route from root.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from flask import redirect

from .app import APP
from .main import render_main


@APP.route('/', methods=('GET',))
def route():
    """Route on root page.   """

    if APP.config.get('local_dir'):
        return redirect('/local')

    return render_main()
