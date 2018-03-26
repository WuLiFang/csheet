# -*- coding=UTF-8 -*-
"""HTML csheet page.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from jinja2 import Environment, PackageLoader

from wlf.path import Path

from .image import HTMLImage, get_images_from_dir
from .__about__ import __version__


def updated_config(config=None):
    """Return a default csheet config or updated default from given @config. """

    default = {'static': ('dist/csheet.css',
                          'dist/csheet.bundle.js'),
               'static_folder': 'static',
               '__version__': __version__}

    if config:
        default.update(config)

    return default


def from_list(images_list, **config):
    """Create a html page for a @images_list.  """

    config.update({
        'images': [HTMLImage(i) for i in images_list],
    })

    env = Environment(
        loader=PackageLoader(__name__),
    )

    template = env.get_template('csheet.html')

    return template.render(**updated_config(config))


def from_dir(images_folder, **config):
    """Create a html page for a @images_folder.  """

    path = Path(images_folder)
    images = get_images_from_dir(images_folder)
    config.setdefault('title', path.name)

    return from_list(images, **config)
