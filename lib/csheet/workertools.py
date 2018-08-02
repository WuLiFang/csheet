# -*- coding=UTF-8 -*-
"""Tools for worker.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import sys
import time
from functools import wraps
from multiprocessing import Semaphore

import sqlalchemy.exc
from gevent import sleep

from .database import Meta
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


class Locked(Exception):
    """Lock has been locked.  """


class DatabaseLock(object):
    """Database lock.  """
    expire = 600

    def __init__(self, name):
        self.name = name
        self.key = 'Lock-{}'.format(name)
        self.expire_at = None
        self.acquire_time = None
        self._start_clock_time = None

    def __enter__(self):
        self.acquire()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()

    def _handle_locked(self, is_block, timeout):
        if timeout and time.clock() > self._start_clock_time + timeout:
            raise Locked('Time out')
        elif is_block:
            time.sleep(1)
        else:
            raise Locked

    def acquire(self, block=True, timeout=None):
        """Acquire the lock.  """

        is_block = block
        self._start_clock_time = time.clock()

        value = Meta.get(self.key)

        try:
            while time.time() - value < self.expire:
                self._handle_locked(is_block, timeout)
                value = Meta.get(self.key)
        except TypeError:
            pass
        except Locked:
            return False

        now = time.time()
        Meta.set(self.key, now)
        self.acquire_time = now

        return True

    def release(self):
        """Release the lock.  """

        if not self.acquire_time:
            raise RuntimeError('Can not release lock that not acquired.')
        while time.time() < self.acquire_time + self.expire:
            try:
                return Meta.set(self.key, None)
            except sqlalchemy.exc.OperationalError:
                self._handle_locked(is_block=True, timeout=None)


def worker_concurrency(value=1, is_block=True, timeout=10, lock_cls=Semaphore):
    """Decorator factory for set task concurrency on single worker.  """

    _lock = lock_cls(value)

    def _wrap(func):
        @wraps(func)
        def _func(*args, **kwargs):
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


def database_single_instance(name, is_block=True, timeout=10):
    """Decorator factory for set task concurrency to 1 on same database.  """

    return worker_concurrency(value=name,
                              is_block=is_block,
                              timeout=timeout,
                              lock_cls=DatabaseLock)
