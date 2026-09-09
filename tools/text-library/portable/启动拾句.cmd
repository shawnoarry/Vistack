@echo off
chcp 65001 >nul
cd /d "%~dp0"
"%~dp0拾句\node.exe" "%~dp0拾句\server.mjs" --open
pause
