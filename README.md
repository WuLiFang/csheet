# 色板服务器

## 功能

- 实时更新
- 自动视频转码
- 自动生成缩略图
- 与 CGTeamWork5.2 集成

## 使用方法

### 安装

Windows 系统下载 [源代码] 后运行 [安装.cmd](./安装.cmd) 即可一键安装

Linux 系统参考 [Dockerfile](./Dockerfile) 安装依赖

成功后会有构建好的文件出现在 `dist` 文件夹中

### 运行

运行 [start.cmd](./start.cmd) 就会开一个服务器

使用默认配置时会使用本机 80 端口

并使用当前盘符 `/srv/csheet` 作为存储路径

### 配置

参照 [default_settings.py](./backend/csheet/default_settings.py) 写一个配置文件

然后设置环境变量`CSHEET_CONFIG`为配置文件的路径

### 部署

使用 Docker 部署

请自行参考 [build.py](./build.py) [example_config](./example_config) 中的内容

## NO LICENSE 版权保留

吾立方内部使用, 其他人使用需先联系获取授权

[项目主页](https://github.com/WuLiFang/csheet)

[源代码]: ./archive/master.zip
