@echo off
setlocal EnableExtensions EnableDelayedExpansion
title FinTrack Pro - 1-Click PC Installer & Launcher

echo ====================================================================
echo             FinTrack Pro - 1-Click PC Installer & Setup
echo ====================================================================
echo.

cd /d "%~dp0.."

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed on this PC.
    echo Please download and install Node.js (v18 or v20 LTS) from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/3] Creating "FinTrack Pro (Offline)" Desktop Shortcut...
echo.

set VBS_SCRIPT=%TEMP%\CreateFinTrackShortcut.vbs
set TARGET_BAT=%~dp0Start_FinTrack_Pro.bat

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\FinTrack Pro (Offline).lnk" >> "%VBS_SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_SCRIPT%"
echo oLink.TargetPath = "%TARGET_BAT%" >> "%VBS_SCRIPT%"
echo oLink.WorkingDirectory = "%~dp0.." >> "%VBS_SCRIPT%"
echo oLink.Description = "FinTrack Pro - Offline Personal and Shared Finance Tracker" >> "%VBS_SCRIPT%"
echo oLink.Save >> "%VBS_SCRIPT%"

cscript /nologo "%VBS_SCRIPT%" >nul 2>nul
del "%VBS_SCRIPT%" >nul 2>nul

echo [SUCCESS] Desktop shortcut created: "FinTrack Pro (Offline)"
echo.

echo [2/3] Installing/Verifying required dependencies...
call npm install --no-audit
if %ERRORLEVEL% NEQ 0 (
    echo Retrying with force flag...
    call npm install --force
)

echo.
echo [3/3] Launching FinTrack Pro in your default browser...
echo Local Address: http://localhost:3000
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"
call npm run dev
