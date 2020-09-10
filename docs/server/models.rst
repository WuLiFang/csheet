数据模型
==============


.. uml::

  class "CollectedEvent\n收集事件" as CollectLogEvent {
    OriginPrefix string
    Time time.Time
    UpdatedCount int
  }

  class "Collection\n收藏" as Collection {
    Origin string
    Title string
    Metadata map[string]string
    CollectTime time.Time
    PresentationIDs []string
  }

  class "File\n文件" as File {
    Path string
    ModTime time.Time
    Size int64
  }

  class "Presentation\n展示" as Presentation {
    Type Type
    Raw string
    Thumb string
    ThumbSuccessTag string
    ThumbErrorTag string
    Regular string 
    RegularSuccessTag string
    RegularErrorTag string
  }
  Presentation "1" *--> "*" File
  Collection "*" o--> "*" Presentation



.. toctree::
  :maxdepth: 2
  :glob:

  models/*
