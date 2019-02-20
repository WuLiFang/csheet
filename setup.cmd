cd /d %~dp0
py -3 -m pip install -U pip pipenv
py -3 -m pipenv install -d
cmd /c npm --registry=https://registry.npm.taobao.org i -d
npm run build
PAUSE