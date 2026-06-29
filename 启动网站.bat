@echo off
cd /d "E:\Web\MiyaWeb\server"
start "MiyaWeb" /MIN "E:\Asoftinstall\nodeJS\node.exe" index.js

cd /d "E:\Web\frp_0.61.0_windows_amd64\frp_0.61.0_windows_amd64"
start "FRP" /MIN frpc.exe -c frpc.toml

echo MiyaWeb + FRP started
ping 127.0.0.1 -n 5 >nul
