# 色板服务器

[![Build Status](https://travis-ci.org/WuLiFang/csheet.svg?branch=master)](https://travis-ci.org/WuLiFang/csheet)
[![Maintainability](https://api.codeclimate.com/v1/badges/49c1acebb3d8cbce8ea5/maintainability)](https://codeclimate.com/github/WuLiFang/csheet/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/49c1acebb3d8cbce8ea5/test_coverage)](https://codeclimate.com/github/WuLiFang/csheet/test_coverage)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

[项目主页](https://github.com/WuLiFang/csheet)
[文档](https://wulifang.github.io/csheet/)

## 功能

- [x] 实时更新
- [x] 自动视频转码
- [x] 自动生成缩略图
- [x] 与 CGTeamwork5.2 集成

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

参照 [default_settings.py](./server/csheet/default_settings.py) 写一个配置文件

然后设置环境变量`CSHEET_CONFIG`为配置文件的路径

### 部署

使用 Docker 部署

请自行参考 [build.py](./build.py) [example_config](./example_config) 中的内容

## NO LICENSE 版权保留

吾立方内部使用, 其他人使用需先联系获取授权

[源代码]: https://github.com/WuLiFang/csheet/archive/master.zip
