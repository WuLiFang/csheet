# -*- coding=UTF-8 -*-
"""All exceptions csheet server may thorw.   """

from six import text_type

from flask import abort, escape, make_response


def u_abort(status, msg):
    """Abort with unicode message.  """

    abort(make_response(escape(text_type(msg)), status, {
        'Content-Type': 'text/html; charset=utf-8'}))
