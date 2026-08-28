@echo off
setlocal EnableExtensions
title FinTrack Pro - Offline Local App

cd /d "%~dp0.."

echo ====================================================================
echo             FinTrack Pro - Offline Local Server
echo ====================================================================
echo.
echo Starting app at: http://localhost:3000
echo.

start "" http://localhost:3000
call npm run dev
