# -*- coding=UTF-8 -*-
"""Base items for csheet. """

from __future__ import print_function, unicode_literals
from collections import Iterable
from abc import abstractmethod

from wlf.path import PurePath
from wlf.files import copy


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
        self.__path = PurePath(path)
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


class ContactSheet(list):
    """Contactsheet for images.  """

    title = None

    def __init__(self, images):
        assert isinstance(images, Iterable)

        list.__init__(self, (Image(i) for i in images))
        for i in images:
            i.parent = self

    def __setitem__(self, index, value):
        return list.__setitem__(self, index, Image(value))

    @abstractmethod
    def generate(self, path, **kwargs):
        """Generate csheet to given @path.  """
        raise NotImplementedError


class FootageError(Exception):
    """Indicate no footage available."""

    def __unicode__(self):
        return '在文件夹中没有可用图像'
