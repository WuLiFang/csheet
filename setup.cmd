cd /d %~dp0
py -3 -m pip install -U pip pipenv
py -3 -m pipenv install -d
npm i -g mirror-config-china --registry=https://registry.npm.taobao.org
npm i -d
npm run build
PAUSE