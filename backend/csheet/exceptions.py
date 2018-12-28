# -*- coding=UTF-8 -*-
"""All exceptions csheet server may throw.   """

from flask import abort, escape, make_response
from six import text_type


def u_abort(status, msg):
    """Abort with unicode message.  """

    abort(make_response(escape(text_type(msg)), status, {
        'Content-Type': 'text/html; charset=utf-8'}))


class WorkerException(Exception):
    """Base exceptions for worker.  """


class WorkerIdle(WorkerException):
    """Indicate no job for worker.  """
