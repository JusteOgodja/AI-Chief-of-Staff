@echo off
REM Script to start the AI Chief of Staff frontend on Windows

echo 🚀 Starting AI Chief of Staff Frontend...

REM Check if we're in the right directory
cd /d "%~dp0\frontend_modern" || exit /b 1

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first: https://nodejs.org/
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm first.
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Start the development server
echo 🌐 Starting Vite development server on http://localhost:8080
echo ⏹️  Press Ctrl+C to stop the server
npm run dev
