TITLE csheet server
cd /d %~dp0/..

set "PY_PYTHOHN=3.7"
REM Install required programs
choco --version || @ CALL :SUDO iex "((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin" && cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd
make --version || CALL :SUDO cinst -y make && @ cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd
git --version || CALL :SUDO cinst -y git && @ cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd
py --version || CALL :SUDO cinst -y python3 && cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd
node --version || CALL :SUDO cinst -y nodejs-lts && @ cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd
ffmpeg -version || CALL :SUDO cinst -y ffmpeg && @ cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd
py -m poetry --version || py -m pip install poetry && poetry config virtualenvs.in-project true


REM RUN SERVER
make -C server serve

PAUSE
GOTO :EOF

:SUDO
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "Start-Process -Wait -FilePath powershell.exe -ArgumentList @('-NoProfile', '-InputFormat', 'None', '-ExecutionPolicy', 'Bypass', '-Command', 'cd', '%cd%', ';', """%*""") -verb RunAs"
GOTO :EOF
