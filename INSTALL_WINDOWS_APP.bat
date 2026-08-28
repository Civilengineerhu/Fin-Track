@echo off
setlocal EnableExtensions
title FinTrack Pro - Windows App Setup

echo ====================================================================
echo             FinTrack Pro - Windows Offline App Installer
echo ====================================================================
echo.

cd /d "%~dp0"

echo [1/2] Creating your Offline Desktop Shortcut...
echo.

set VBS_SCRIPT=%TEMP%\CreateFinTrackShortcut.vbs
set TARGET_BAT=%~dp0START_LOCAL_OFFLINE.bat

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\FinTrack Pro (Offline).lnk" >> "%VBS_SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_SCRIPT%"
echo oLink.TargetPath = "%TARGET_BAT%" >> "%VBS_SCRIPT%"
echo oLink.WorkingDirectory = "%~dp0" >> "%VBS_SCRIPT%"
echo oLink.Description = "FinTrack Pro - Offline Personal and Shared Finance Tracker" >> "%VBS_SCRIPT%"
echo oLink.Save >> "%VBS_SCRIPT%"

cscript /nologo "%VBS_SCRIPT%"
del "%VBS_SCRIPT%"

echo.
echo ====================================================================
echo  [SUCCESS] "FinTrack Pro (Offline)" shortcut created on your Desktop!
echo ====================================================================
echo.
echo [2/2] Launching FinTrack Pro locally on your Windows PC now...
echo.

call "%TARGET_BAT%"
