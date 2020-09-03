文件监控
======================

检查文件变更，并将相关展示标记为过期。

仅检查当前被订阅的 :doc:`models/presentation` 对应的 :doc:`models/file`。

.. uml::

  start
  :比对数据库和硬盘文件信息;
  if (信息匹配)
  elseif (信息不匹配)
    :更新数据库信息;
    :标记相关展示为过期;
  elseif (文件不存在)
    :删除数据库信息;
  endif
  stop

每次完整检查的最低间隔 5 秒，同时检查的文件数量和速率由 :doc:`env-vars` 配置。
