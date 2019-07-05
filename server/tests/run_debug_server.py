# -*- coding=UTF-8 -*-
"""Contactsheet test.  """


from tests import util

import csheet
import csheet.__main__
import generate_test_page

PORT = 5001


def main():
    util.setup()

    generate_test_page.main()
    csheet.generation.GENERATION_TASKS.pop()
    csheet.__main__.clear_lock()

    csheet.SOCKETIO.run(csheet.APP,
                        'localhost', PORT,
                        debug=True,
                        use_reloader=False)


if __name__ == '__main__':
    main()
