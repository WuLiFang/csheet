TITLE csheet server
cd /d %~dp0
IF NOT EXIST dist cmd /c setup.cmd
ffmpeg -version || CALL :SUDO cinst -y ffmpeg && cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd
CALL .venv/Scripts/activate.bat
SET "PYTHONPATH=server"
SET "FLASK_APP=csheet:APP"
python -m csheet runserver --host 0.0.0.0 --port 80

PAUSE
GOTO :EOF

:SUDO
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "Start-Process -Wait -FilePath powershell.exe -ArgumentList @('-NoProfile', '-InputFormat', 'None', '-ExecutionPolicy', 'Bypass', '-Command', 'cd', '%cd%', ';', """%*""") -verb RunAs"
GOTO :EOF
