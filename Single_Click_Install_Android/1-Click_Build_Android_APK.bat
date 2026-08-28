@echo off
setlocal EnableExtensions EnableDelayedExpansion
title FinTrack Pro - 1-Click Android APK Builder

echo ================================================================
echo        FinTrack Pro - 1-Click Android APK Builder
echo ================================================================
echo.

cd /d "%~dp0.."

:: 1. Check for '&' in path
echo "%CD%" | findstr /C:"&" >nul
if %ERRORLEVEL% EQU 0 (
    echo [ERROR] The current folder path contains an ampersand ('&'):
    echo "%CD%"
    echo Please rename the folder without '&' and run this script again.
    pause
    exit /b 1
)

:: 2. Check for Node.js
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js / npm not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install --no-audit
if %ERRORLEVEL% NEQ 0 (
    call npm install --force
)

echo.
echo [2/4] Building production web application bundle...
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Web build failed.
    pause
    exit /b 1
)

echo.
echo [3/4] Syncing Android Capacitor project...
if not exist "android\app" (
    echo Adding Android platform...
    call npx cap add android
)
call npx cap sync android

echo.
echo [4/4] Compiling Direct .APK file...

if exist "android\gradlew.bat" (
    echo Running Gradle direct APK compilation...
    cd android
    call gradlew.bat assembleDebug
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ================================================================
        echo  [SUCCESS] ANDROID APK COMPILED SUCCESSFULLY!
        echo ================================================================
        echo.
        
        if exist "app\build\outputs\apk\debug\app-debug.apk" (
            copy "app\build\outputs\apk\debug\app-debug.apk" "%~dp0FinTrack_Pro.apk" >nul 2>nul
            copy "app\build\outputs\apk\debug\app-debug.apk" "%~dp0..\FinTrack_Pro.apk" >nul 2>nul
            echo Your APK file is ready:
            echo   - In this folder: %~dp0FinTrack_Pro.apk
            echo   - In main folder: %~dp0..\FinTrack_Pro.apk
        )
        cd /d "%~dp0.."
        echo.
        echo You can now copy FinTrack_Pro.apk to your Android phone and install!
        echo ================================================================
        pause
        exit /b 0
    ) else (
        echo [INFO] Direct Gradle compile requires Java JDK on PATH.
        cd /d "%~dp0.."
    )
)

echo.
echo Opening project in Android Studio for 1-Click APK generation...
call npx cap open android

echo.
echo ================================================================
echo IN ANDROID STUDIO:
echo   Click: Build -> Build Bundle(s) / APK(s) -> Build APK(s)
echo ================================================================
pause
