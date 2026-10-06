@echo off
echo Read-only Windows Wi-Fi snapshot helper. No settings are changed.
powershell.exe -NoProfile -File "%~dp0WiFi-Snapshot.ps1"
echo If script policy blocked the helper, use netsh wlan show interfaces manually.
pause
