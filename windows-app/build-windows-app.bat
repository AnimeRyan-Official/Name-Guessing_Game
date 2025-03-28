@echo off
echo Student Name Quiz - Windows App Builder
echo ======================================
echo.
echo This script will build the Windows executable (.exe) for the Student Name Quiz application.
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Step 1: Installing dependencies for Windows app...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install Windows app dependencies.
    pause
    exit /b 1
)

echo.
echo Step 2: Building main application...
cd ..
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to build main application.
    cd windows-app
    pause
    exit /b 1
)

echo.
echo Step 3: Returning to Windows app directory...
cd windows-app

echo.
echo Step 4: Running preparation script...
call npm run prepare-build
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to run preparation script.
    pause
    exit /b 1
)

echo.
echo Step 5: Creating Windows executable...
call npm run make-exe
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to create Windows executable.
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.
echo You can find the executable files in the "dist" directory:
echo - Student Name Quiz-1.0.0-Setup.exe (Installer)
echo - Student Name Quiz-1.0.0-Portable.exe (Portable version)
echo.
echo Press any key to exit...
pause > nul