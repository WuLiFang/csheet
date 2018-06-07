# -*- coding=UTF-8 -*-
"""Tools for worker.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import sys

from gevent import sleep

from .exceptions import WorkerIdle


def work_forever(func, logger, **kwargs):
    """Try execute forever

        func(function): Target function.
        logger (logging.logger): Logger.
        fail_delay (int, optional): Defaults to 1. Sleep time in seconeds when execute fails.
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

    exctype, value = sys.exc_info()[:2]
    if exctype is WorkerIdle:
        return idle_delay
    elif exctype in (KeyboardInterrupt, SystemExit):
        raise value

    logger.error('Error during %s.', label, exc_info=True)
    return fail_delay