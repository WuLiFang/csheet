文件
=========================

.. uml::

  class "File\n文件" as File {
    Path string
    ModTime time.Time
    Size int64
  }

记录文件元数据，更改数据不影响硬盘上的文件。

结构
------------

Path string

  文件路径，相对路径相对 :doc:`../file-store` 。

ModTime time.Time

  文件修改时间。

Size int64

  文件大小。


.. _内容标签:

内容标签
-------------------

根据文件元数据生成的字符串，相同内容标签的文件视为同一文件。

标签格式: ``{16进制修改时间Unix纳秒数}-{16进制文件尺寸}``
