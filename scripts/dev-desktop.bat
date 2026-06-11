@echo off
cd /d "%~dp0..\desktop"
if not exist node_modules call npm install
npm start
