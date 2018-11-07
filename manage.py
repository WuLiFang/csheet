#!/usr/bin/env python
# -*- coding=UTF-8 -*-
"""CSheet manage script.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import codecs
import getpass
import subprocess

import fire

from csheet.__about__ import __version__
from wlf.pathtools import make_path_finder

file_path = make_path_finder(__file__)  # pylint: disable=invalid-name

# pylint: disable=missing-docstring


def upload_config(dirname, host, ssh_port=22):
    ssh_port = str(ssh_port)
    subprocess.call(
        ['pscp', '-P', ssh_port,
         file_path('docker-compose.yml'),
         '{host}:/srv/csheet/docker-compose.yml'.format(host=host)])
    subprocess.call(
        ['pscp', '-P', ssh_port, '-r',
         '{}/*'.format(dirname), '{host}:/srv/csheet'.format(host=host)])


def compose_up(host, ssh_port=22):
    ssh_port = str(ssh_port)
    subprocess.call(['plink', '-P', ssh_port, host,
                     '(cd /srv/csheet && docker-compose up -d)'])


def push_image(repo, host=None, ssh_port=22):
    ssh_port = str(ssh_port)
    tags = ('csheet:latest',
            'csheet:{}'.format(__version__))

    for i in tags:
        remote_tag = '/'.join([repo, i])
        if host:
            subprocess.call(['plink', '-P', ssh_port, host,
                             'docker tag {tag} {remote_tag} && '
                             'docker push {remote_tag}'.format(
                                 tag=i, remote_tag=remote_tag)])
        else:
            subprocess.call(['docker', 'tag', i, remote_tag])
            subprocess.call(['docker', 'push', remote_tag])


def build_image(name='csheet'):
    subprocess.call(['docker', 'build', file_path(),
                     '--tag', '{}:latest'.format(name),
                     '--tag', '{}:{}'.format(name, __version__)])


def install_compose_for_boot2docker(host, ssh_port=22):
    ssh_port = str(ssh_port)
    subprocess.call(
        ['plink', '-P', ssh_port, host,
         'echo \'su docker -c "tce-load -wi python" && '
         'curl https://bootstrap.pypa.io/get-pip.py | '
         'python - && pip install -U docker-compose\' | '
         'sudo tee -a /var/lib/boot2docker/bootlocal.sh > /dev/null && '
         'sudo chmod +x /var/lib/boot2docker/bootlocal.sh'])
    subprocess.call(
        ['plink', '-P', ssh_port, host,
         'tce-load -wi python && curl https://bootstrap.pypa.io/get-pip.py | '
         'sudo python - && sudo pip install -U docker-compose'])


def plink_copy_id(host, filename, ssh_port=22, password=None):
    ssh_port = str(ssh_port)
    if '@' not in host:
        host = '{}@{}'.format(
            raw_input('Login name for {}:'.format(host)), host)
    password = password or getpass.getpass(
        '{}\'s password:'.format(host).encode('utf-8'))

    with codecs.open(filename, encoding='utf-8') as f:
        subprocess.call(
            ['plink', '-P', ssh_port, host,
             '-pw', password,
             'umask 077; test -d .ssh || mkdir .ssh ; '
             'cat >> .ssh/authorized_keys'],
            stdin=f)


if __name__ == '__main__':
    fire.Fire()
