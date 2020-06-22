
环境变量
================

CSHEET_ENV

  运行环境, "development" 或者 "production"。

CSHEET_STORAGE

  :doc:`filestore` 文件夹路径。

CSHEET_ADDRESS

  服务运行地址。默认：localhost:80

CSHEET_CGTEAMWORK_MAX_TASK_PER_COLLECT

  每次从 CGTeamwork 收集时的最大任务数量。默认：1000。

CSHEET_CGTEAMWORK_PIPELINE_OVERWRITE

  覆盖流程收集时使用的流程名称，JSON 编码的字典。

CSHEET_FOLDER_INCLUDE

  从文件夹收集允许的文件夹，使用 ``*`` 代表允许任何文件夹。
 
  多个路径用逗号分隔。

CSHEET_WATCH_RATE

  限制每秒钟最多检查多少文件的更新，默认值：50。

CSHEET_FOLDER_EXCLUDE

  扫描文件夹时的前缀排除模式，用逗号分隔。

CSHEET_FILE_LIFE

  生成的文件保留时间, 默认为 240 小时。

  使用 go 时间格式，例如：1h2m3s。

CSHEET_TEMP_LIFE

  残留的临时文件保留时间, 默认为 1 小时。

  使用 go 时间格式，例如：1h2m3s。

CSHEET_WEB_SENTRY_DSN

  网页端 Sentry DSN。

CSHEET_SERVER_SENTRY_DSN

  服务端 Sentry DSN。

CSHEET_RELEASE

  发布版本，在 Sentry 事件中记录。

CSHEET_ISSUE_TRACKER_URL

  问题反馈网址，显示在客户端界面上。

CGTEAMWORK_URL

  CGTeamwork 服务器地址。例：http://192.168.50.11

CGTEAMWORK_USERNAME

  CGTeamwork 用户名

CGTEAMWORK_PASSWORD

  CGTeamwork 密码
