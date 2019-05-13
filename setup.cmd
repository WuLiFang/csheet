TITLE csheet setup
cd /d %~dp0

REM Install required programs
choco --version || @ CALL :SUDO iex "((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin" && cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd
git --version || CALL :SUDO cinst -y git && @ cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd
py -3.7 --version || CALL :SUDO cinst -y python3 && @ setx "PIPENV_VENV_IN_PROJECT" 1 && cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd
cmd /c npm --version || CALL :SUDO cinst -y nodejs-lts && @ cmd /c %ProgramData%/chocolatey/bin/RefreshEnv.cmd

REM Setup mirrors
ping -n 1 google.com ^
    || set "PIP_MIRROR=https://mirrors.aliyun.com/pypi/simple" ^
    && cmd /c npm i -g mirror-config-china --registry=https://registry.npm.taobao.org

REM Install dependencies
py -3.7 -m pip install -U pip virtualenv
IF NOT EXIST .venv/Scripts/activate.bat (py -3.7 -m virtualenv .venv)
call .venv/Scripts/activate.bat
pip install -r requirements.txt -r requirements-dev.txt
cmd /c npm i

REM Build frontend files
cmd /c npm run build

PAUSE
GOTO :EOF

:SUDO
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "Start-Process -Wait -FilePath powershell.exe -ArgumentList @('-NoProfile', '-InputFormat', 'None', '-ExecutionPolicy', 'Bypass', '-Command', 'cd', '%cd%', ';', """%*""") -verb RunAs"
GOTO :EOF
