cd /d %~dp0
pip install pipenv
pipenv install -d
cmd /c npm --registry=https://registry.npm.taobao.org i -d
npm run build
PAUSE