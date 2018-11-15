# -*- coding=UTF-8 -*-
"""Contactsheet test.  """


import generate_test_page
import util
from csheet import APP, SOCKETIO, generation

PORT = 5001


def main():
    util.setup()

    generate_test_page.main()
    generation.GENERATION_TASKS.pop()

    SOCKETIO.run(APP,
                 'localhost', PORT,
                 debug=True)


if __name__ == '__main__':
    main()
