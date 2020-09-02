数据模型
==============


.. uml::

  class "CollectedEvent\n收集事件" as CollectLogEvent

  class "Collection\n收集" as Collection

  class "File\n文件" as File 

  class "Presentation\n展示" as Presentation 
  Presentation "1" *--> "*" File
  Collection "1" o--> "*" Presentation

.. toctree::
  :maxdepth: 2
  :glob:

  models/*
