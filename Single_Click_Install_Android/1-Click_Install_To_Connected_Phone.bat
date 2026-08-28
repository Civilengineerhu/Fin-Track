@echo off
setlocal EnableExtensions
title FinTrack Pro - 1-Click Install to Connected Phone

echo ================================================================
echo    FinTrack Pro - Install Directly to Connected Android Phone
echo ================================================================
echo.

cd /d "%~dp0.."

where adb >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [NOTE] ADB tool not found on system PATH.
    echo Searching in Android SDK default locations...
    if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
        set "PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools;%PATH%"
    )
)

where adb >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] ADB (Android Debug Bridge) not found.
    echo Please build the APK first using '1-Click_Build_Android_APK.bat'
    echo and transfer FinTrack_Pro.apk to your phone manually.
    echo.
    pause
    exit /b 1
)

echo Checking for connected Android devices...
adb devices
echo.

set APK_PATH=%~dp0FinTrack_Pro.apk
if not exist "%APK_PATH%" (
    set APK_PATH=%~dp0..\android\app\build\outputs\apk\debug\app-debug.apk
)

if not exist "%APK_PATH%" (
    echo [INFO] APK not found. Running APK builder first...
    call "%~dp01-Click_Build_Android_APK.bat"
)

if exist "%APK_PATH%" (
    echo Installing APK to your connected phone...
    adb install -r "%APK_PATH%"
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ================================================================
        echo  [SUCCESS] FinTrack Pro successfully installed on your phone!
        echo ================================================================
    ) else (
        echo [ERROR] Installation failed. Ensure USB Debugging is allowed on your phone.
    )
)

pause
