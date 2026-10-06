@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (echo Python 3 is needed for the optional server. Open index.html instead. & pause & exit /b 1)
start "" "http://127.0.0.1:8002"
python -m http.server 8002 --bind 127.0.0.1
