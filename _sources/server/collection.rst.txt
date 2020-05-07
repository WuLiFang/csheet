收集
==========================

收集是通过不同渠道获取到的色板单元。

每个收集可有多个不同的呈现方式，例如视频方式和图片方式。

.. uml::

  left to right direction
  :用户: --> (查看收集)
  :用户: --> (导入收集)
  :用户: --> (打包收集)
  :用户: --> (为收集添加标签)
  :用户: --> (查看最近的收集事件)
  :用户: --> (查看收集当前查看人数)
  [系统] --> (转码文件)
  [系统] --> (监控文件变更)
  (查看收集) ..> (转码文件)
  (转码文件) .> (监控文件变更)
  (监控文件变更) .> (查看收集当前查看人数): 跳过无人使用的文件

.. uml::

  class "CollectedEvent\n收集事件" as CollectLogEvent {
    OriginPrefix string
    Time time.Time
    UpdatedCount int
  }

  class "Collection\n收集" as Collection {
    Origin string
    Title string
    Metadata map[string]string
    Tags []string
    CollectTime time.Time
  }
  CollectLogEvent "*" x--> "*" Collection


  class "File\n文件" as File {
    Path string
    ModTime Time
    Size Int64
    Stat() error
  }
  enum "PresentationType\n展示类型" as PresentationType {
    IMAGE
    VIDEO
  }
  class "Presentation\n展示" as Presentation {
    Type PresentationType
    Raw File
    Thumb File
    Regular File
    Transcode()
  }
  Presentation "1" *--> "*" File
  Collection "1" o--> "*" Presentation
  Presentation "*" x-> "1" PresentationType


元数据
-----------------------

记录收集的额外数据。

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
