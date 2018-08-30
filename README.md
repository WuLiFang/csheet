色板服务器

# 功能

- 实时更新
- 自动视频转码
- 自动生成缩略图
- 与CGTeamWork5.2集成

# 使用方法

## 构建

需求:

- [python2.7.15](https://www.python.org/downloads/release/python-2715/)或[更新](https://www.python.org/downloads/)(python3未测试)
- [node.js](https://nodejs.org/en/download/)

安装了需求的软件之后运行[setup.cmd](./setup.cmd) 即可构建

构建好的文件会在`dist`文件夹中

## 运行

运行 [start.cmd](./start.cmd) 就会开一个服务器

使用默认配置时会使用本机80端口

并使用当前盘符`/srv/csheet`作为存储路径

## 配置

参照 [default_settings.py](./lib/csheet/default_settings.py) 写一个配置文件

然后设置环境变量`CSHEET_CONFIG`为配置文件的路径

## 部署

使用Docker部署

请自行参考[manage.py](./manage.py)中的内容
