@echo off
setlocal EnableExtensions
title FinTrack Pro - Local Windows Offline Server

cd /d "%~dp0"

echo ====================================================================
echo          FinTrack Pro - Local Windows Offline Server
echo ====================================================================
echo.

echo [1/2] Checking dependencies...
call npm install --no-audit

echo.
echo [2/2] Starting local app on http://localhost:3000 ...
start "" http://localhost:3000
call npm run dev
