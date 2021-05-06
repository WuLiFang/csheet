@ECHO OFF
CHCP 936
cd /d "%~dp0"

echo 环境变量配置参考 https://wulifang.github.io/csheet/server/env-vars.html
set "CSHEET_ENV=production"
set /p CSHEET_RELEASE=<VERSION
set "CSHEET_ADDRESS=0.0.0.0:80"
set "CSHEET_DATA_PATH=data"

"%~dp0csheet.exe"

PAUSE
