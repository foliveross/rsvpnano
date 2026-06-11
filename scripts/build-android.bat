@echo off
cd /d "%~dp0..\android"
call gradlew.bat :app:assembleRelease
echo APK: android\app\build\outputs\apk\release\
