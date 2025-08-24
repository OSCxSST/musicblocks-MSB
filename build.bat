@echo off
setlocal enabledelayedexpansion

REM Music Blocks Electron Build Script for Windows
REM This script builds the Electron application for multiple platforms

echo 🎵 Building Music Blocks Desktop Application...

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16 or higher.
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm.
    exit /b 1
)

echo [SUCCESS] Node.js and npm detected

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed
) else (
    echo [INFO] Dependencies already installed
)

REM Run linting
echo [INFO] Running code linting...
call npm run lint
if %errorlevel% neq 0 (
    echo [WARNING] Linting completed with warnings
)

REM Build based on command line argument
set PLATFORM=%1
if "%PLATFORM%"=="" set PLATFORM=current

if /i "%PLATFORM%"=="windows" goto :build_windows
if /i "%PLATFORM%"=="win" goto :build_windows
if /i "%PLATFORM%"=="macos" goto :build_macos
if /i "%PLATFORM%"=="mac" goto :build_macos
if /i "%PLATFORM%"=="linux" goto :build_linux
if /i "%PLATFORM%"=="all" goto :build_all
goto :build_current

:build_windows
echo [INFO] Building for Windows...
call npm run dist-win
if %errorlevel% neq 0 (
    echo [ERROR] Windows build failed
    exit /b 1
)
echo [SUCCESS] Windows build completed! Check dist-electron\ folder
goto :show_artifacts

:build_macos
echo [INFO] Building for macOS...
call npm run dist-mac
if %errorlevel% neq 0 (
    echo [ERROR] macOS build failed
    exit /b 1
)
echo [SUCCESS] macOS build completed! Check dist-electron\ folder
goto :show_artifacts

:build_linux
echo [INFO] Building for Linux...
call npm run dist-linux
if %errorlevel% neq 0 (
    echo [ERROR] Linux build failed
    exit /b 1
)
echo [SUCCESS] Linux build completed! Check dist-electron\ folder
goto :show_artifacts

:build_all
echo [INFO] Building for all platforms...
echo [INFO] Building Windows...
call npm run dist-win
if %errorlevel% neq 0 (
    echo [ERROR] Windows build failed
    exit /b 1
)
echo [INFO] Building macOS...
call npm run dist-mac
if %errorlevel% neq 0 (
    echo [ERROR] macOS build failed
    exit /b 1
)
echo [INFO] Building Linux...
call npm run dist-linux
if %errorlevel% neq 0 (
    echo [ERROR] Linux build failed
    exit /b 1
)
echo [SUCCESS] All platform builds completed! Check dist-electron\ folder
goto :show_artifacts

:build_current
echo [INFO] Building for current platform...
call npm run dist
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    exit /b 1
)
echo [SUCCESS] Build completed! Check dist-electron\ folder

:show_artifacts
REM Show build artifacts
echo [INFO] Build artifacts:
if exist "dist-electron" (
    dir /b dist-electron\
) else (
    echo [WARNING] No build artifacts found in dist-electron\ folder
)

echo [SUCCESS] 🎉 Music Blocks Desktop build process completed!
echo.
echo To run the application:
echo   npm run electron
echo.
echo To start development:
echo   npm run electron-dev
echo.
echo Visit the dist-electron\ folder for distribution files.

endlocal
