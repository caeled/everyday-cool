@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:8004/ in your browser. Close this window to stop.
python -m http.server 8004 --bind 127.0.0.1
pause
