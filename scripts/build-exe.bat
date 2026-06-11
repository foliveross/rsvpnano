@echo off
cd /d "%~dp0..\desktop"
if not exist node_modules call npm install
call npm run build
echo Build output: desktop\dist\
