@echo off
rem The Baton Box — double-click starter for Windows.
rem Starts the box in this folder and keeps the window open.
cd /d "%~dp0"
echo Starting the Baton Box...
echo (If Python is not installed, get it free from python.org
echo  and tick "Add Python to PATH" during install.)
echo.
python baton_box.py
if errorlevel 1 (
  echo.
  echo Python could not start. Trying "py" instead...
  py baton_box.py
)
pause
