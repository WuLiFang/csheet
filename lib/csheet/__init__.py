# -*- coding=UTF-8 -*-
"""Contactsheet creation."""
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
from .__about__ import __version__

LOGGER = logging.getLogger(__name__)


def create_html_from_dir(image_folder, save_path=None, **config):
    """Create a html page for a @image_folder.  """

    from .image import from_dir, RESOURCES_DIR
    from wlf.path import PurePath, Path

    images_folder_path = PurePath(image_folder)
    save_path = (Path(save_path) if save_path
                 else Path(image_folder)
                 .with_name('{}_色板.html'.format(images_folder_path.name)))
    config.setdefault('relative_to', images_folder_path.parent)
    config['static_folder'] = RESOURCES_DIR.as_uri()
    data = from_dir(images_folder_path, **config)
    with save_path.open('w', encoding='UTF-8') as f:
        f.write(data)
    return save_path
