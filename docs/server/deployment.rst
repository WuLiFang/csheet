部署
=============

参考 ``deployments`` 文件夹下的示例文件。

.. _`环境变量`:

环境变量
---------------

CSHEET_SETTINGS

  配置文件文件名，其中设置的值将覆盖环境变量的配置。

SECRET_KEY

  会话加密私钥，在生产环境中\ **必须**\ 设置。

  可用 ``openssl rand --hex 32`` 生成。

MESSAGE_QUEUE_URL

  消息队列 URL。

RESULT_BACKEND_URL

  Celery 任务结果后端 URL。

BACKEND_SENTRY_DSN

  服务端 Sentry DSN。

FRONTEND_SENTRY_DSN

  网页端 Sentry DSN。

STORAGE

  默认值: ``/srv/csheet``

  文件存放路径。

DATABASE_URL

  默认值: ``sqlite:///:memory:``

  数据库路径。

CGTEAMWORK_URL

  CGTeamWork 服务器 URL。 如未配置将不启用 CGTeamWork 色板。

WATCH_INTERVAL

  默认值: 1

  文件变更检查间隔。

WATCH_CHUNK_SIZE

  默认值: 50

  每次检查文件数量。


BROADCAST_INTERVAL

  默认值: 5

  文件最低更新间隔秒数。

PREVIEW_SIZE_LIMIT

  默认值: 10MB

  视频预览大小限制， 设置为 0 为不限制大小。

DAEMON_TASK_EXPIRES

  默认值: 3

  后台任务过期秒数。

MAX_TASK_TIME

  默认值: 3600

  最长任务执行时间分钟数。

COOKIE_LIFE

  默认值: 7776000 (3个月)

  Cookie 有效分钟数。

STANDALONE

  默认值: False

  是否为单进程模式，设为 True 启用。

DEBUG_SQL

  默认值: False

  是否启用 SQL 日志，设为 True 启用。 

CACHE_LIFE

  默认值: 30

  缓存保留天数。
