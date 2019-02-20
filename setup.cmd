cd /d %~dp0

REM Install required programs
choco --version || sudo install_chocolatey.cmd && %ProgramData%/chocolatey/bin/RefreshEnv.cmd
git --version || sudo cinst -y git && %ProgramData%/chocolatey/bin/RefreshEnv.cmd
py -3.7 --version || sudo cinst -y python3 && %ProgramData%/chocolatey/bin/RefreshEnv.cmd
cmd /c npm --version || sudo cinst -y nodejs-lts && %ProgramData%/chocolatey/bin/RefreshEnv.cmd

REM Setup mirrors
setx "PIPENV_VENV_IN_PROJECT" 1
set "PIPENV_VENV_IN_PROJECT=1" 
ping -n 1 google.com ^
    || set "PIP_MIRROR=https://mirrors.aliyun.com/pypi/simple" ^
    && set "PIPENV_PYPI_MIRROR=https://mirrors.aliyun.com/pypi/simple" ^
    && cmd /c npm i -g mirror-config-china --registry=https://registry.npm.taobao.org

REM Install dependencies
py -3 -m pip install -U pip pipenv
py -3 -m pipenv install -d
cmd /c npm i -d

REM Build frontend files
cmd /c npm run build
PAUSE