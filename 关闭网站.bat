@echo off
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do taskkill /f /pid %%a 2>nul
taskkill /f /im frpc.exe 2>nul
echo MiyaWeb + FRP stopped.
ping 127.0.0.1 -n 2 >nul
