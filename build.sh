#!/bin/bash

# Music Blocks Electron Build Script
# This script builds the Electron application for multiple platforms

set -e

echo "🎵 Building Music Blocks Desktop Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 16 or higher."
    exit 1
fi

print_success "Node.js version $NODE_VERSION detected"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Run linting
print_status "Running code linting..."
npm run lint || print_warning "Linting completed with warnings"

# Build based on command line argument
PLATFORM=${1:-"current"}

case $PLATFORM in
    "windows" | "win")
        print_status "Building for Windows..."
        npm run dist-win
        print_success "Windows build completed! Check dist-electron/ folder"
        ;;
    "macos" | "mac")
        print_status "Building for macOS..."
        npm run dist-mac
        print_success "macOS build completed! Check dist-electron/ folder"
        ;;
    "linux")
        print_status "Building for Linux..."
        npm run dist-linux
        print_success "Linux build completed! Check dist-electron/ folder"
        ;;
    "all")
        print_status "Building for all platforms..."
        print_status "Building Windows..."
        npm run dist-win
        print_status "Building macOS..."
        npm run dist-mac
        print_status "Building Linux..."
        npm run dist-linux
        print_success "All platform builds completed! Check dist-electron/ folder"
        ;;
    "current" | *)
        print_status "Building for current platform..."
        npm run dist
        print_success "Build completed! Check dist-electron/ folder"
        ;;
esac

# Show build artifacts
print_status "Build artifacts:"
if [ -d "dist-electron" ]; then
    ls -la dist-electron/
else
    print_warning "No build artifacts found in dist-electron/ folder"
fi

# Show file sizes
if [ -d "dist-electron" ]; then
    print_status "Build sizes:"
    du -sh dist-electron/* 2>/dev/null || print_warning "Could not determine build sizes"
fi

print_success "🎉 Music Blocks Desktop build process completed!"
echo ""
echo "To run the application:"
echo "  npm run electron"
echo ""
echo "To start development:"
echo "  npm run electron-dev"
echo ""
echo "Visit the dist-electron/ folder for distribution files."
