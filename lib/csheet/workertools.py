# -*- coding=UTF-8 -*-
"""Tools for worker.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)


def try_execute(func, logger, label='execute'):
    """Try execute with a logger, never fail."""

    try:
        return func()
    except (KeyboardInterrupt, SystemExit):
        raise
    except:  # pylint: disable=bare-except
        logger.error('Error during %s.', label, exc_info=True)
