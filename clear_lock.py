#!/usr/bin/env python
# -*- coding=UTF-8 -*-
"""Clear database lock.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from csheet import database


def main():
    with database.session_scope() as sess:
        sess.query(database.Meta).filter(
            database.Meta.key.startswith('Lock-')
        ).delete(synchronize_session=False)


if __name__ == '__main__':
    main()
