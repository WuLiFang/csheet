# -*- coding=UTF-8 -*-
"""HTML csheet page.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from jinja2 import Environment, PackageLoader

from wlf.path import Path

from .image import HTMLImage, get_images_from_dir


def updated_config(config=None):
    """Return a default csheet config or updated default from given @config. """

    default = {'static': ('csheet.css',
                          'es5-shim.min.js',
                          'es5-sham.min.js',
                          'json3.min.js',
                          'es6-shim.min.js',
                          'es6-sham.min.js',
                          'html5shiv.min.js',
                          'jquery-3.2.1.min.js',
                          'jquery.appear.js',
                          'csheet.js'),
               'static_folder': 'static'}

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
