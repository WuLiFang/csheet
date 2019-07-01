CGTeamWork
=========================

在 CGTeamWork 色板页面更新时向 CGTeamWork 抓取任务数据

如果发现任务在 CGTeamWork 上删除则本地任务也会随之删除。

数据结构
--------------

CGTeamWork 任务(CGTeamWorkTask)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

uuid

  类型: String

  和 CGTeamWork 上相同的任务 ID。

database

  类型: String

  CGTeamWork 数据库名称。

module

  类型: String

  CGTeamWork 模块名称。

videos

  类型: relationship(m2m) -> Video

  和此任务相关的视频。

pipeline

  类型: String

  流程名称。

shot

  类型: String

  镜头名称。

artists

  类型: JSONData, 字符串数组。

  制作者。

leader_status

  类型: String

  组长状态。

director_status

  类型: String

  导演状态。

client_status

  类型: String

  客户状态。

note_num

  类型: Integer

  备注数量。
