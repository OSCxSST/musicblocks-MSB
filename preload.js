const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // File operations
    saveFile: (filename, content) => ipcRenderer.invoke('save-file', filename, content),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    
    // Menu communication
    onMenuAction: (callback) => {
        // Remove existing listeners to prevent memory leaks
        ipcRenderer.removeAllListeners('menu-new-project');
        ipcRenderer.removeAllListeners('menu-open-file');
        ipcRenderer.removeAllListeners('menu-save-project');
        ipcRenderer.removeAllListeners('menu-save-as');
        ipcRenderer.removeAllListeners('menu-export-midi');
        ipcRenderer.removeAllListeners('menu-export-png');
        ipcRenderer.removeAllListeners('menu-export-svg');
        ipcRenderer.removeAllListeners('menu-export-wav');
        ipcRenderer.removeAllListeners('menu-play');
        ipcRenderer.removeAllListeners('menu-stop');
        ipcRenderer.removeAllListeners('menu-run-slowly');
        ipcRenderer.removeAllListeners('menu-run-step');
        ipcRenderer.removeAllListeners('menu-statistics');
        ipcRenderer.removeAllListeners('menu-load-plugin');
        ipcRenderer.removeAllListeners('menu-toggle-mode');
        
        // Set up new listeners
        ipcRenderer.on('menu-new-project', () => callback('new-project'));
        ipcRenderer.on('menu-open-file', (event, filePath) => callback('open-file', filePath));
        ipcRenderer.on('menu-save-project', () => callback('save-project'));
        ipcRenderer.on('menu-save-as', (event, filePath) => callback('save-as', filePath));
        ipcRenderer.on('menu-export-midi', () => callback('export-midi'));
        ipcRenderer.on('menu-export-png', () => callback('export-png'));
        ipcRenderer.on('menu-export-svg', () => callback('export-svg'));
        ipcRenderer.on('menu-export-wav', () => callback('export-wav'));
        ipcRenderer.on('menu-play', () => callback('play'));
        ipcRenderer.on('menu-stop', () => callback('stop'));
        ipcRenderer.on('menu-run-slowly', () => callback('run-slowly'));
        ipcRenderer.on('menu-run-step', () => callback('run-step'));
        ipcRenderer.on('menu-statistics', () => callback('statistics'));
        ipcRenderer.on('menu-load-plugin', () => callback('load-plugin'));
        ipcRenderer.on('menu-toggle-mode', (event, mode) => callback('toggle-mode', mode));
    },
    
    // Platform information
    platform: process.platform,
    
    // Version information
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    }
});

// Expose a minimal API for Music Blocks specific features
contextBridge.exposeInMainWorld('musicBlocksAPI', {
    isElectron: true,
    platform: process.platform,
    
    // Enhanced file system access for offline mode
    fileSystemAccess: {
        supported: true,
        saveProject: async (projectData, filename) => {
            return await ipcRenderer.invoke('save-file', filename || 'project.ta', projectData);
        },
        loadProject: async (filePath) => {
            return await ipcRenderer.invoke('read-file', filePath);
        }
    },
    
    // Offline capabilities
    offline: {
        enabled: true,
        cacheManagement: true
    }
});
