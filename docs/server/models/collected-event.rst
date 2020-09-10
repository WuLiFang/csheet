收集事件
====================


.. uml::

  class "CollectedEvent\n收集事件" as CollectLogEvent {
    OriginPrefix string
    Time time.Time
    UpdatedCount int
  }



记录收集请求。

结构
----------------------

OriginPrefix string

  收集的来源前缀

Time time.Time

  收集时间

UpdatedCount int

  更新的收集个数

