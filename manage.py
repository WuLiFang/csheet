#!/usr/bin/env python3
"""Manage script.  """

import os
import subprocess
import sys

if __name__ == '__main__':
    subprocess.call([sys.executable, '-m', 'csheet'] + sys.argv[1:],
                    cwd=os.path.join(os.path.dirname(__file__), 'backend'))
