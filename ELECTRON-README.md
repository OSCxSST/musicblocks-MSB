# Music Blocks Desktop Application

## Overview

Music Blocks Desktop is an Electron-based standalone application that brings the full Music Blocks experience to your desktop with enhanced offline capabilities and native OS integration.

## Features

### 🔥 Core Features
- **Offline Support**: Full functionality without internet connection
- **Native File System**: Enhanced file operations with system dialogs
- **Cross-Platform**: Runs on Windows, macOS, and Linux
- **Native Menus**: Platform-specific menu integration
- **Keyboard Shortcuts**: Standard desktop application shortcuts
- **Auto-Updates**: Built-in update mechanism

### 🎵 Music Blocks Features
- Visual programming with musical blocks
- Real-time audio synthesis
- MIDI support and export
- Multiple export formats (PNG, SVG, WAV, MIDI)
- Interactive music creation
- Educational programming concepts

## Installation

### Pre-built Downloads
Download the latest release for your platform:
- **Windows**: `Music-Blocks-Setup-x.x.x.exe` (Installer) or `Music-Blocks-x.x.x.exe` (Portable)
- **macOS**: `Music-Blocks-x.x.x.dmg`
- **Linux**: `Music-Blocks-x.x.x.AppImage`, `.deb`, or `.rpm`

### Build from Source

#### Prerequisites
- Node.js 16 or higher
- npm or yarn
- Git

#### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/sugarlabs/musicblocks.git
   cd musicblocks
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run electron-dev
   ```

4. Build for production:
   ```bash
   # Build for current platform
   npm run dist
   
   # Build for specific platforms
   npm run dist-win     # Windows
   npm run dist-mac     # macOS
   npm run dist-linux   # Linux
   ```

## Usage

### Running the Application
- **Development**: `npm run electron-dev`
- **Production**: `npm run electron` (after building)
- **Installed**: Use desktop shortcut or command line

### Keyboard Shortcuts
- `Ctrl/Cmd + N` - New Project
- `Ctrl/Cmd + O` - Open Project
- `Ctrl/Cmd + S` - Save Project
- `Ctrl/Cmd + Shift + S` - Save As
- `Space` - Play/Pause
- `Escape` - Stop
- `F11` - Toggle Fullscreen

### Menu Features
#### File Menu
- New Project
- Open Project (supports .ta, .tb, .html, .mid, .midi files)
- Save Project / Save As
- Export (MIDI, PNG, SVG, WAV)

#### Edit Menu
- Standard editing operations (Undo, Redo, Cut, Copy, Paste)

#### View Menu
- Zoom controls
- Developer tools (in development mode)
- Toggle fullscreen

#### Playback Menu
- Play/Stop controls
- Run slowly
- Step-by-step execution

#### Tools Menu
- Statistics display
- Plugin management
- Mode switching (Beginner/Advanced)

## Offline Capabilities

### Cached Resources
The application caches essential resources for offline use:
- Core application files
- JavaScript libraries
- CSS stylesheets
- Images and icons
- Sound files
- Documentation

### Offline Features
- Complete music composition functionality
- Local file save/load operations
- Audio playback and synthesis
- Block programming interface
- Export capabilities

### Service Worker
The enhanced service worker provides:
- Intelligent caching strategies
- Background synchronization
- Update notifications
- Fallback offline pages

## Architecture

### Main Process (`electron.js`)
- Application lifecycle management
- Native menu creation
- File system operations
- Security hardening
- Window management

### Renderer Process (`index.html`)
- Music Blocks web application
- Electron integration layer
- Enhanced file operations
- Offline capability management

### Preload Script (`preload.js`)
- Secure IPC communication
- Context isolation
- API exposure to renderer

### Integration Layer (`electron-integration.js`)
- Menu action handling
- Keyboard shortcuts
- Enhanced file operations
- Offline status management

## Security

### Implemented Security Measures
- Context isolation enabled
- Node integration disabled
- Remote module disabled
- Content Security Policy
- Secure file system access
- External link handling

### File System Access
- Sandboxed file operations
- User-initiated file dialogs
- Restricted file type access
- Path validation

## Development

### Project Structure
```
musicblocks/
├── electron.js           # Main Electron process
├── preload.js           # Preload script for security
├── electron-integration.js # Integration layer
├── offline.html         # Offline fallback page
├── sw.js               # Enhanced service worker
├── package.json        # Dependencies and scripts
├── build/              # Build configuration
│   ├── entitlements.mac.plist
│   └── music-blocks.desktop
└── dist-electron/      # Built applications
```

### Build Configuration
The build process uses `electron-builder` with platform-specific configurations:

- **Windows**: NSIS installer and portable executable
- **macOS**: DMG with code signing support
- **Linux**: AppImage, DEB, and RPM packages

### Development Scripts
```bash
# Development
npm run electron-dev      # Run with live reload
npm run dev              # Start web server only
npm run electron         # Run production build

# Building
npm run build           # Prepare for build
npm run dist           # Build for current platform
npm run dist-win       # Build for Windows
npm run dist-mac       # Build for macOS
npm run dist-linux     # Build for Linux

# Testing
npm test              # Run tests
npm run cypress:run   # Run E2E tests
```

## Troubleshooting

### Common Issues

#### Application Won't Start
- Check Node.js version (16+ required)
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

#### Build Failures
- Ensure all dependencies are installed
- Check platform-specific requirements
- Verify electron-builder configuration

#### Audio Issues
- Check system audio settings
- Ensure Web Audio API support
- Try different audio output devices

#### File Operations
- Check file permissions
- Verify file format support
- Ensure sufficient disk space

### Debug Mode
Run with debug flags:
```bash
DEBUG=electron* npm run electron
```

### Logs
Application logs are stored in:
- **Windows**: `%APPDATA%/Music Blocks/logs/`
- **macOS**: `~/Library/Logs/Music Blocks/`
- **Linux**: `~/.config/Music Blocks/logs/`

## Contributing

### Setup Development Environment
1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a feature branch
5. Make changes and test
6. Submit a pull request

### Testing
- Unit tests: `npm test`
- E2E tests: `npm run cypress:run`
- Manual testing across platforms

### Code Style
- Follow existing code style
- Use ESLint for JavaScript
- Comment complex logic
- Update documentation

## License

Music Blocks is licensed under the AGPL-3.0 License. See [LICENSE](LICENSE) for details.

## Credits

- **Original Music Blocks**: Sugar Labs team
- **Electron Integration**: Community contributors
- **Icons**: Activity icons from Sugar Labs
- **Audio Engine**: Tone.js and Web Audio API

## Support

- **Documentation**: [Music Blocks Guide](https://github.com/sugarlabs/musicblocks/tree/master/guide)
- **Issues**: [GitHub Issues](https://github.com/sugarlabs/musicblocks/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sugarlabs/musicblocks/discussions)
- **Community**: Sugar Labs community forums

---

*Made with ♪ by the Sugar Labs community*
