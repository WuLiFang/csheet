# -*- coding=UTF-8 -*-
"""Tools for worker.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import sys
from functools import wraps
from multiprocessing import Semaphore

from gevent import sleep

from .exceptions import WorkerIdle


def work_forever(func, logger, **kwargs):
    """Try execute forever

        func(function): Target function.
        logger (logging.logger): Logger.
        fail_delay (int, optional): Defaults to 1. Sleep time in seconds when execute fails.
        label (str, optional): Defaults to 'work', for logger message.
    """

    while True:
        delay = 0
        try:
            func()
        except:  # pylint: disable=bare-except
            delay = _handle_worker_exceptions(logger, **kwargs)
        sleep(delay)


def _handle_worker_exceptions(logger, **kwargs):
    label = kwargs.pop('label', 'work')
    fail_delay = kwargs.pop('fail_delay', 0.5)
    idle_delay = kwargs.pop('idle_delay', 10)

    exc_type, value = sys.exc_info()[:2]
    if exc_type is WorkerIdle:
        return idle_delay
    elif exc_type in (KeyboardInterrupt, SystemExit):
        raise value

    logger.error('Error during %s.', label, exc_info=True)
    return fail_delay


class Locked(Exception):
    """Lock has been locked.  """


def worker_concurrency(value=1, is_block=True, timeout=5, lock_cls=Semaphore):
    """Decorator factory for set task concurrency on single worker.  """

    _lock = lock_cls(value)
    _timeout = timeout

    def _wrap(func):

        @wraps(func)
        def _func(*args, **kwargs):
            timeout = _timeout() if callable(_timeout) else _timeout
            if _lock.acquire(block=is_block, timeout=timeout):
                try:
                    return func(*args, **kwargs)
                finally:
                    _lock.release()
            if is_block:
                raise Locked
            return None

        setattr(_func, '_lock', _lock)

        return _func

    return _wrap
