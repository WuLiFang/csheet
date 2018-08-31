色板服务器

# 功能

- 实时更新
- 自动视频转码
- 自动生成缩略图
- 与 CGTeamWork5.2 集成

# 使用方法

## 需求

需求:

- [python2.7.15](https://www.python.org/downloads/release/python-2715/)或[更新](https://www.python.org/downloads/)(python3 未测试)
- [node.js](https://nodejs.org/en/download/)
- [ffmpeg4.0.2](https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-4.0.2-win64-static.zip)或[更新](https://ffmpeg.org/download.html)
- [源代码](https://github.com/WuLiFang/csheet/archive/master.zip)

## 构建

1. 下载并解压源代码
2. 安装需求的软件
3. ffmpeg.exe 放到解压目录下或者[将所在目录设置在 PATH 中](https://www.java.com/zh_CN/download/help/path.xml)
4. 运行[setup.cmd](./setup.cmd)

构建好的文件会在`dist`文件夹中

## 运行

运行 [start.cmd](./start.cmd) 就会开一个服务器

使用默认配置时会使用本机 80 端口

并使用当前盘符`/srv/csheet`作为存储路径

## 配置

参照 [default_settings.py](./lib/csheet/default_settings.py) 写一个配置文件

然后设置环境变量`CSHEET_CONFIG`为配置文件的路径

## 部署

使用 Docker 部署

请自行参考[manage.py](./manage.py)中的内容

# NO LICENSE 版权保留

吾立方内部使用, 其他人使用需先联系获取授权

[项目主页](https://github.com/WuLiFang/csheet)
