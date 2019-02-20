cd /d %~dp0
set "PIPENV_VENV_IN_PROJECT=1"
ffmpeg -version || sudo cinst -y ffmpeg && %ProgramData%/chocolatey/bin/RefreshEnv.cmd
py -3 -m pipenv run python -m csheet runserver
PAUSE