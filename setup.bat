@echo off
setlocal

echo === AI Olympiad setup ===
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not on PATH.
  echo Install Node 20+ from https://nodejs.org then reopen Command Prompt.
  exit /b 1
)

where git >nul 2>&1
if errorlevel 1 (
  echo ERROR: Git is not installed or not on PATH.
  echo Install Git from https://git-scm.com then reopen Command Prompt.
  exit /b 1
)

if not exist package.json (
  echo ERROR: package.json not found in this folder.
  echo You are probably on the wrong branch or folder.
  echo Run:
  echo   git fetch origin
  echo   git checkout cursor/the-arena-pwa-d388
  exit /b 1
)

echo Node:
node -v
echo npm:
call npm -v
echo.

if not exist .env.local (
  if exist .env.example (
    copy /Y .env.example .env.local >nul
    echo Created .env.local from .env.example
  )
)

echo Installing dependencies...
call npm install
if errorlevel 1 exit /b 1

echo.
echo Starting dev server at http://localhost:3000
echo Press Ctrl+C to stop.
echo.
call npm run dev
