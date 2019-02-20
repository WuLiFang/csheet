cd /d %~dp0
ping -n 1 google.com ^
    || set "PIP_MIRROR=https://mirrors.aliyun.com/pypi/simple" ^
    && set "PIPENV_PYPI_MIRROR=https://mirrors.aliyun.com/pypi/simple" ^
    && cmd /c npm i -g mirror-config-china --registry=https://registry.npm.taobao.org
py -3 -m pip install -U pip pipenv
py -3 -m pipenv install -d
cmd /c npm i -d
cmd /c npm run build
PAUSE