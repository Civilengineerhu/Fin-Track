@echo off
setlocal EnableExtensions EnableDelayedExpansion
title FinTrack Pro - Direct Android APK Builder

echo ================================================================
echo        FinTrack Pro - Direct Android APK Builder
echo ================================================================
echo.

cd /d "%~dp0"

:: 1. Path check for '&'
echo "%CD%" | findstr /C:"&" >nul
if %ERRORLEVEL% EQU 0 (
    echo [ERROR] The current folder path contains an ampersand ('&'):
    echo "%CD%"
    echo Please rename the folder without '&' (e.g., FinTrackPro) and run this again.
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
echo [2/4] Building web application bundle...
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Web build failed.
    pause
    exit /b 1
)

echo.
echo [3/4] Setting up Android platform...
if not exist "android\app" (
    echo Adding Android platform...
    call npx cap add android
)
echo Syncing project assets...
call npx cap sync android

echo.
echo [4/4] Compiling Direct .APK file...

if exist "android\gradlew.bat" (
    echo Running Gradle direct APK build...
    cd android
    call gradlew.bat assembleDebug
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ================================================================
        echo  [SUCCESS] DIRECT APK BUILT SUCCESSFULLY!
        echo ================================================================
        echo.
        echo Your APK file is ready at:
        echo   %~dp0android\app\build\outputs\apk\debug\app-debug.apk
        echo.
        if exist "app\build\outputs\apk\debug\app-debug.apk" (
            copy "app\build\outputs\apk\debug\app-debug.apk" "%~dp0FinTrack_Pro.apk" >nul 2>nul
            if exist "%~dp0FinTrack_Pro.apk" (
                echo Copied directly to your main folder as:
                echo   %~dp0FinTrack_Pro.apk
            )
        )
        cd /d "%~dp0"
        echo.
        echo You can now transfer FinTrack_Pro.apk to your Android phone and install!
        echo ================================================================
        pause
        exit /b 0
    ) else (
        echo [INFO] Direct Gradle compile requires Java JDK installed on your PC.
        cd /d "%~dp0"
    )
)

echo.
echo Attempting to launch Android Studio for 1-click APK build...
call npx cap open android

echo.
echo ================================================================
echo IN ANDROID STUDIO:
echo   Click: Build -> Build Bundle(s) / APK(s) -> Build APK(s)
echo ================================================================
pause
