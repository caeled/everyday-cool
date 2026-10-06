@echo off
setlocal
echo Nerd Heaven - download recordings beside this course
echo Keep this file in the extracted course folder on your USB or computer.
echo.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Download-Media.ps1"
echo.
pause
endlocal
