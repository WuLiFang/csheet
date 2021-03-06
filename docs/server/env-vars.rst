
环境变量
================

CSHEET_ENV

  运行环境, "development" 或者 "production"。

CSHEET_ADDRESS

  服务运行地址。默认：localhost:80

CSHEET_DATA_PATH

  :doc:`file-store` 文件夹路径，默认为工作目录下 storage 文件夹。

CSHEET_FILE_LIFE

  生成的文件保留时间, 默认为 240 小时。

  使用 go 时间格式，例如：1h2m3s。

CSHEET_TEMP_LIFE

  残留的临时文件保留时间, 默认为 1 小时。

  使用 go 时间格式，例如：1h2m3s。

CSHEET_WATCH_RATE

  限制每秒钟最多检查多少文件的更新，默认值：50。

CSHEET_WATCH_WORKERS

  文件监控并发数量，默认为 8。

CSHEET_COLLECT_IGNORE

  收集文件路径正则表达式忽略规则，多个值用换行符分割。

CSHEET_CGTEAMWORK_MAX_TASK_PER_COLLECT

  每次从 CGTeamwork 收集时的最大任务数量。默认：1000。

CSHEET_CGTEAMWORK_PIPELINE_OVERWRITE

  覆盖流程收集时使用的流程名称，JSON 编码的字典。例：``{"合成":["合成","输出"],"灯光":["灯光","渲染"]}``

CSHEET_FOLDER_INCLUDE

  从文件夹收集允许的文件夹，使用 ``*`` 代表允许任何文件夹。

  多个路径用逗号分隔。

CSHEET_FOLDER_EXCLUDE

  扫描文件夹时的前缀排除模式，用逗号分隔。

CSHEET_CLIENT_SENTRY_DSN

  客户端 Sentry 地址配置。

  后缀添加 _{客户端类型大写} 可对特定客户端指定覆盖值。

CSHEET_CLIENT_SENTRY_TRACES_SAMPLE_RATE

  客户端 Sentry 性能跟踪取样率配置，范围 0 - 1.0 。

  后缀添加 _{客户端类型大写} 可对特定客户端指定覆盖值。

CSHEET_SERVER_SENTRY_DSN

  服务端 Sentry DSN。

CSHEET_RELEASE

  发布版本，在 Sentry 事件中记录。

CSHEET_ISSUE_TRACKER_URL

  问题反馈网址，显示在客户端界面上。

CSHEET_TRANSCODE_MAX_WEIGHT

  最大的转码工作权重，同时进行的工作权重和不会超过此值，默认为 1024。

CSHEET_TRANSCODE_IMAGE_THUMB_WEIGHT

  缩略尺寸图片转码工作权重，默认为 1024 / (CPU 核数 / 2 + 1)。

CSHEET_TRANSCODE_IMAGE_REGULAR_WEIGHT

  标准尺寸图片转码工作权重，默认为 1024 / (CPU 核数 / 2 + 1)。

CSHEET_TRANSCODE_VIDEO_REGULAR_WEIGHT

  标准尺寸视频转码工作权重，默认为 1024 / 2 + 1。

CSHEET_CORS_HOSTS

  逗号分隔的主机 CORS 域名列表，例：``example.com,example.org``

  使用非标准端口时要添加端口号。

CSHEET_ADMIN_TOKEN

  调用 API 管理相关字段时使用的令牌。

  必须设置且调用时提供相同令牌才能执行相关字段。

CSHEET_DISABLE_WEBP

  禁用 WebP 图像格式，用 PNG 或者 JPG 代替。

CSHEET_API_TRACING_ENABLED

  为 API 启用 `apollo-tracing <https://github.com/apollographql/apollo-tracing>`_

CSHEET_ARCHIVE_COLLECTION_LIMIT

  限制归档打包的收藏数量，默认为 1000。

USE_X_FORWARDED_FOR

  是否使用 X-Forwarded-For 表头来记录 IP。

CGTEAMWORK_URL

  CGTeamwork 服务器地址。例：http://192.168.50.11

CGTEAMWORK_USERNAME

  CGTeamwork 用户名

CGTEAMWORK_PASSWORD

  CGTeamwork 密码
