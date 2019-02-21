cd /d %~dp0
IF NOT EXIST dist cmd /c setup.cmd
set "PIPENV_VENV_IN_PROJECT=1"
ffmpeg -version || CALL :SUDO cinst -y ffmpeg && cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd
py -3 -m pipenv run python -m csheet runserver --host 0.0.0.0 --port 0
PAUSE

:SUDO
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "Start-Process -Wait -FilePath powershell.exe -ArgumentList @('-NoProfile', '-InputFormat', 'None', '-ExecutionPolicy', 'Bypass', '-Command', 'cd', '%cd%', ';', """%*""") -verb RunAs" 
GOTO :EOF