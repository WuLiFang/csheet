数据库迁移
=================

使用 `alembic <https://alembic.sqlalchemy.org/>`_ 进行迁移。

在服务器启动时会自动把数据库迁移到最新状态。


创建迁移:

.. code-block:: shell

  alembic revision -m "迁移名称"
