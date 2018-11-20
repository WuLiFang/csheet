#!/usr/bin/env python3
"""Build script for docker."""

import json
import subprocess

import fire

from wlf.pathtools import make_path_finder

file_path = make_path_finder(__file__)  # pylint: disable=invalid-name
with open(file_path('package.json')) as f:
    __version__ = json.load(f)['version']


def build_image(name='csheet'):
    subprocess.call(['docker', 'build', file_path(),
                     '--tag', '{}:latest'.format(name),
                     '--tag', '{}:{}'.format(name, __version__)])


if __name__ == '__main__':
    fire.Fire(build_image)
