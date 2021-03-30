HTTP 路由
=====================

系统将于绑定的端口运行 HTTP 服务，路由配置：

/

  前端网页应用主页，提供访问工作目录下的 dist/index.html 文件。

/favicon.ico

  站点图标，提供访问工作目录下的 dist/favicon.ico 文件。

/static

  静态资产文件，提供访问工作目录下的 dist/static 文件夹。

/api

  :doc:`api`。

/files

  由系统管理的文件，提供访问 :doc:`file-store` files 文件夹。

  找不到文件时如果对应路径有对应的 :doc:`models/presentation`，会将展示标记为过期。

/cgteamwork/upload

  使用服务器账号对 cgteamwork 的 `/upload` 路由进行反向代理以提供免登陆上传文件访问。

/cgteamwork/img

  对 cgteamwork 的 `/img` 路由进行反向代理以提供表情文件访问。

/archive

  供 :doc:`archive` 使用
    

/debug/pprof

  开发模式下可用，pprof 网页调试端点。
