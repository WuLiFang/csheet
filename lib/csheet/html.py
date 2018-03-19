# -*- coding=UTF-8 -*-
"""HTML csheet page.  """
from __future__ import absolute_import, print_function, unicode_literals

import logging
import mimetypes
import os
import uuid

from jinja2 import Environment, PackageLoader
from six import PY3, text_type

from wlf import ffmpeg
from wlf.files import copy, version_filter
from wlf.path import get_encoded as e
from wlf.path import get_unicode as u
from wlf.path import Path, PurePath

from .base import Image

try:
    from gevent.lock import Semaphore
except ImportError:
    from threading import Semaphore


LOGGER = logging.getLogger('wlf.chseet.html')
RESOURCES_DIR = Path(os.path.abspath(os.path.join(__file__, '../../static')))


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


class HTMLImage(Image):
    """A image in html contactsheet page.  """

    _cache = {}
    _is_initiated = False
    folder_names = {
        'thumb': 'thumbs',
        'preview': 'previews',
        'full': 'images'
    }
    file_suffix = {
        'thumb': '.jpg',
        'preview': '.mp4',
        'full': '.jpg'
    }
    generate_methods = {
        'thumb': ffmpeg.generate_jpg,
        'preview': ffmpeg.generate_mp4,
        'full': ffmpeg.generate_jpg
    }
    max_skipgen_size = 1 * 2 ** 20  # 1MB

    def __new__(cls, path):
        if isinstance(path, HTMLImage):
            return path

        try:
            return cls.from_uuid(cls.get_uuid(path))
        except KeyError:
            pass

        return super(HTMLImage, cls).__new__(cls, path)

    def __init__(self, path):
        if (isinstance(path, HTMLImage)
                or self._is_initiated):
            return

        super(HTMLImage, self).__init__(path)
        self.locks = {i: Semaphore() for i in self.folder_names}
        self.uuid = self.get_uuid(path)
        self.source = {}
        self.generated = {}

        type_ = text_type(mimetypes.guess_type(text_type(self.path))[0])
        if type_.startswith('image/'):
            self.source['full'] = self.source['thumb'] = self.path
        elif type_.startswith('video/'):
            self.source['preview'] = self.path

        HTMLImage._cache[self.uuid] = self

        self._is_initiated = True

    def __getnewargs__(self):
        return (self.path,)

    @classmethod
    def get_uuid(cls, path):
        """Get uuid for path.

        Args:
            path (pathLike object): Image path.

        Returns:
            str: hex uuid.
        """

        if PY3:
            path = u(path)
        else:
            path = e(path)
        return uuid.uuid5(uuid.NAMESPACE_URL, path).hex

    @classmethod
    def from_uuid(cls, uuid_):
        """Get image from uuid.

        Args:
            uuid_ (str): uuid of image.

        Returns:
            HTMLImage: image with that uuid.
        """

        return cls._cache[uuid_]

    def get_drag(self, **config):
        """get path used on drag.  """

        if config.get('is_pack'):
            return '{}/{}'.format(
                self.folder_names['full'],
                self.path.name)

        try:
            return self.path.as_uri()
        except ValueError:
            return ''

    def get(self, role, **config):
        """Get url for given role.

        Args:
            role (str): role name, key of self.folder_names.
            **config (dict): jinja config env

        Returns:
            str: url  for role name.
        """

        if config.get('is_client'):
            return ('/images/{}.{}'.format(self.uuid, role))

        if config.get('is_pack'):
            try:
                return '{}/{}'.format(
                    self.folder_names[role],
                    self.generated[role].name)
            except KeyError:
                return ''

        path = self.generated.get(role, self.source.get(role, self.path))
        assert isinstance(path, PurePath)
        try:
            return path.as_uri()
        except ValueError:
            return text_type(path)

    def get_default(self, role):
        """Get default path.

        Args:
            role (str): role name, key of self.folder_names.
            suffix (str): path suffix.

        Returns:
            path.PurePath: Default path.
        """

        path = self.path
        folder_name = self.folder_names[role]
        suffix = self.file_suffix[role]
        filename = path.with_suffix(suffix).name
        if path.is_absolute():
            return (path.with_name(folder_name) / filename)

        return Path.home() / '.wlf/csheet' / folder_name / filename

    def generate(self, role, source=None, output=None, is_strict=True, **kwargs):
        """Generate file for role name.

        Args:
            role (str): role name.
            source (pathLike object, optional): Defaults to None. Source path
            output (pathLike object, optional): Defaults to None. Output path.
            is_strict (bool): Defaults to True,
                if `is_strict` is True,
                raises KeyError when self.source[role] not been set.
                if `is_strict` is False,
                will use self.path as source alternative.
            **kwargs : kwargs for generate method.

        Returns:
            path.Path: Generated file path.
        """

        lock = self.locks[role]
        is_locked = lock.acquire(False)
        if not is_locked:
            raise ValueError('Already generating.')

        try:
            default_kwargs = {
                'thumb': {'height': 200},
            }
            _kwargs = default_kwargs.get(role, {})

            try:
                source = Path(source or self.source[role])
            except KeyError:
                if is_strict:
                    raise

                source = Path(self.path)

            if not source.exists():
                raise ValueError('Source file not exists.', source)

            def _same_mimetype(suffix_a, suffix_b):
                map_ = mimetypes.types_map
                type_a, type_b = map_.get(suffix_a), map_.get(suffix_b)
                return type_a and type_a == type_b

            # Skip some generation to speed up.
            if (output is None
                    # Ensure same memetype.
                    and _same_mimetype(source.suffix.lower(), self.file_suffix[role].lower())
                    # Check size.
                    and source.stat().st_size < self.max_skipgen_size):
                return source

            _kwargs.update(kwargs)
            output = Path(output or self.get_default(role))
            method = self.generate_methods[role]

            output.parent.mkdir(parents=True, exist_ok=True)
            ret = method(source, output, **_kwargs)
            ret = Path(ret)
            self.generated[role] = ret
            return ret
        finally:
            lock.release()

    def download(self, dest):
        """Download this image to dest.  """

        path = PurePath(dest)
        for role in self.folder_names:
            src_path = self.generated.get(role, self.source.get(role))
            if not src_path:
                continue

            dirname = self.folder_names[role]
            dst_path = (path / dirname /
                        self.name).with_suffix(src_path.suffix)

            if src_path.exists():
                copy(src_path, dst_path)


def from_dir(images_folder, **config):
    """Create a html page for a @images_folder.  """

    path = Path(images_folder)
    images = get_images_from_dir(images_folder)
    config.setdefault('title', path.name)

    return from_list(images, **config)


def get_images_from_dir(images_folder):
    """Get HTMLImage for @images_folder.  """

    path = Path(images_folder)
    if not path.is_dir():
        raise ValueError('Not a dir : {}'.format(images_folder))
    images = version_filter(i for i in path.iterdir()
                            if i.is_file()
                            and (text_type(mimetypes.guess_type(text_type(i))[0])
                                 .startswith(('video/', 'image/'))))
    return [HTMLImage(i) for i in images]


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
