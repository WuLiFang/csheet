# -*- coding=UTF-8 -*-
"""HTML image used in csheet page.  """
from __future__ import absolute_import, print_function, unicode_literals

import logging
import os
import uuid

from jinja2 import Environment, PackageLoader
from six import PY3, text_type

from wlf import ffmpeg
from wlf.files import copy, version_filter
from wlf.path import get_encoded as e
from wlf.path import get_unicode as u
from wlf.path import Path, PurePath

from .cache import getmtime
from .filename import filter_filename
from .mimecheck import same_mimetype, is_mimetype

try:
    from gevent.lock import Semaphore
except ImportError:
    from threading import Semaphore

LOGGER = logging.getLogger(__name__)
RESOURCES_DIR = Path(os.path.abspath(os.path.join(__file__, '../../static')))


class Image(object):
    """Image item for contactsheet.  """

    def __new__(cls, path):
        if isinstance(path, Image):
            return path
        return super(Image, cls).__new__(cls)

    def __getnewargs__(self):
        return (self.path,)

    def __init__(self, path):
        # Ignore initiated.
        if isinstance(path, Image):
            return

        # Initiate.
        self.__path = PurePath(filter_filename(path))
        self.name = self.path.shot

    def __eq__(self, other):
        if isinstance(other, Image):
            return other.name == self.name and other.path == self.path
        return False

    @property
    def path(self):
        """Path for this image.  """

        return self.__path

    def __nonzero__(self):
        return bool(self.path)

    def __str__(self):
        return '<Image: {0.name}>'.format(self)

    def __unicode__(self):
        return '<图像: {0.name}>'.format(self)

    def download(self, dest):
        """Download this image to dest.  """

        copy(self.path, dest)


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

        if is_mimetype(self.path, 'image'):
            self.source['full'] = self.source['thumb'] = self.path
        elif is_mimetype(self.path, 'video'):
            self.source['full'] = self.source['thumb'] = self.source['preview'] = self.path

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
            return PurePath(filter_filename(self.path, 'win32')).as_uri()
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
            url = ''
            try:
                timestamp = self.get_timestamp(role)
                url = '/images/{}.{}?timestamp={}'.format(
                    self.uuid, role, timestamp)
            except KeyError:
                pass
            except OSError:
                LOGGER.warning('Get url fail.', exc_info=True)
            return url

        if config.get('is_pack'):
            return '{}/{}'.format(
                self.folder_names[role],
                self.path.with_suffix(self.file_suffix[role]).name)

        path = self.generated.get(role, self.source.get(role, self.path))
        assert isinstance(path, PurePath)
        try:
            return path.as_uri()
        except ValueError:
            return text_type(path)

    def get_timestamp(self, role):
        """Get mtime for role.

        Args:
            role (str): Generated role.

        Returns:
            fload: Timestamp of mtime.
        """

        file_ = self.source[role]
        ret = getmtime(text_type(file_))
        return ret

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

            source = source or self.get_source(role, is_strict)
            source = Path(source)
            if not source.exists():
                raise ValueError('Source file not exists.', source)
            LOGGER.debug('Generation source: %s', source)

            # Skip some generation to speed up.
            if (  # Ensure same memetype.
                    same_mimetype(source.suffix.lower(),
                                  self.file_suffix[role].lower())
                    # Check size.
                    and source.stat().st_size < self.max_skipgen_size):
                ret = source
                if output:
                    ret = copy(source, PurePath(
                        output).with_suffix(self.file_suffix[role]))
                self.generated[role] = ret
                return ret

            output = Path(output or self.get_default(role))
            Path(output.parent).mkdir(parents=True, exist_ok=True)

            _kwargs.update(kwargs)
            method = self.generate_methods[role]

            ret = method(source, output, **_kwargs)
            ret = Path(ret)
            self.generated[role] = ret
            return ret
        finally:
            lock.release()

    def get_source(self, role, is_strict=False, platform=None):
        """Get generation source for the image.

        Args:
            role (str): Generation role.
            is_strict (bool, optional): Defaults to False.
                `False` mean default to self.path if no such role source.
            platform (src, optional): Defaults to None.
                Convert path to match given platform.

        Returns:
            str: Source file path.
        """

        try:
            source = self.source[role]
            if not source:
                raise KeyError
        except KeyError:
            if is_strict:
                raise
            source = self.path
        source = filter_filename(source, platform=platform)
        return source

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


def get_images_from_dir(images_folder):
    """Get HTMLImage for @images_folder.  """

    path = Path(images_folder)
    if not path.is_dir():
        raise ValueError('Not a dir : {}'.format(images_folder))
    images = version_filter(i for i in path.iterdir()
                            if i.is_file()
                            and is_mimetype(i, ('video', 'image')))
    return [HTMLImage(i) for i in images]
