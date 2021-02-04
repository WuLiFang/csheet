收藏
==========================


.. uml::

  class "Collection\n收藏" as Collection {
    Origin string
    Title string
    Metadata map[string]string
    CollectTime time.Time
    PresentationIDs []string
    Tags []string
  }


收藏是通过不同渠道获取到的色板单元。

每个收藏可有多个不同的展示方式，例如视频方式和图片方式。

用户可编辑收藏标签，在系统收集时也会自动更新部分标签。

结构
-------------

Origin string
  
  收集收藏

Title string

  标题

Metadata map[string]string

  收藏元数据，详见下方。

CollectTime time.Time

  最后一次收集的时间

PresentationIDs []string

  收藏提供的展示 ID。

Tags []string

  收藏的标签

元数据
-----------------------

记录收藏的额外数据。

cgteamwork.tasks

  CGTeamwork 相关任务的 JSON 数据。

  .. code:: typescript

    interface Tasks {
      id: string;
      pipeline: string;
      artists: []string;
      status: Record<string, string>;
    }[]

cgteamwork.pipeline

  CGTeamwork 对应流程名称。

comment

  用户留言
