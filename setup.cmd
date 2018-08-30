cd /d %~dp0
REM pip install pipenv
REM pipenv install -d
cmd /c npm --registry=https://registry.npm.taobao.org i -d
npm run build
PAUSE