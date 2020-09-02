GraphQL API
================

系统提供 `GraphQL <https://graphql.cn>`_ API。

:doc:`route` 路径为 /api

实时订阅
---------------------

支持通过 Websocket 进行 GraphQL 订阅，订阅路径也是 /api。


编辑器
----------------------

直接用浏览器访问（HTTP GET Accept 头匹配 text/html）时，
将显示 `Graphql Playground <https://github.com/prisma-labs/graphql-playground>`_ 编辑器。


持久查询
---------------------

支持 `APQ <https://www.apollographql.com/docs/apollo-server/performance/apq/>`_ 来提升查询性能。

发送请求时可用查询摘要代替查询文本。
