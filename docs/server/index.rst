.. csheet documentation master file, created by
   sphinx-quickstart on Mon Jul  1 10:44:31 2019.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

吾立方色板服务系统 文档
==================================

本系统用于统一收集媒体文件并集中查看和使用。

用途：

- 快捷镜头检查，保证临近镜头色调统一。
- 实时更新的网络访问只读媒体库。
- 自动多尺寸转码的媒体文件缓存。

.. uml::

  :用户: --> (查看收集)
  :用户: --> (文件更新实时推送)
  :用户: --> (收集文件)
  [系统] --> (转码文件)
  [系统] --> (监控文件变更)
  [系统] --> (记录文件使用)
  [系统] --> (文件缓存)
  (转码文件) ..> (收集文件)
  (查看收集) ..> (文件缓存)
  (转码文件) ..> (文件缓存)
  (文件更新实时推送) ..> (监控文件变更)
  (转码文件) ..> (监控文件变更)
  (监控文件变更) ..> (记录文件使用): 跳过无人使用的文件


.. toctree::
  :maxdepth: 2

  collectors
  models
  transcode
  file-store
  file-watch
  db
  route
  api
  env-vars

