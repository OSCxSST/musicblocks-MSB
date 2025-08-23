const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Keep a global reference of the window object
let mainWindow;
let serverProcess;

const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || 3000;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'activity', 'activity-icon-color-512.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false
        },
        show: false, // Don't show until ready
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    // Set application menu
    createMenu();

    // Start the local server
    startLocalServer().then(() => {
        // Load the app
        mainWindow.loadURL(`http://localhost:${PORT}`);
        
        // Show window when ready
        mainWindow.once('ready-to-show', () => {
            mainWindow.show();
            
            // Focus on window
            if (isDev) {
                mainWindow.webContents.openDevTools();
            }
        });
    }).catch(err => {
        console.error('Failed to start server:', err);
        dialog.showErrorBox('Server Error', 'Failed to start Music Blocks server. Please try again.');
        app.quit();
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Prevent navigation to external websites
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        const currentUrl = new URL(mainWindow.webContents.getURL());
        
        if (parsedUrl.origin !== currentUrl.origin) {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });
}

function startLocalServer() {
    return new Promise((resolve, reject) => {
        // Check if port is already in use
        const net = require('net');
        const server = net.createServer();

        server.listen(PORT, (err) => {
            if (err) {
                server.close();
                
                // Start the Express server
                serverProcess = spawn('node', ['index.js'], {
                    cwd: __dirname,
                    stdio: 'inherit'
                });

                serverProcess.on('error', (err) => {
                    reject(err);
                });

                // Give server time to start
                setTimeout(() => {
                    resolve();
                }, 2000);
            } else {
                server.close();
                resolve(); // Port is available, server should start
            }
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Port is in use, assume server is already running
                resolve();
            } else {
                reject(err);
            }
        });
    });
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Project',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-new-project');
                    }
                },
                {
                    label: 'Open Project',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const result = await dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [
                                { name: 'Music Blocks Files', extensions: ['ta', 'tb', 'html'] },
                                { name: 'MIDI Files', extensions: ['mid', 'midi'] },
                                { name: 'All Files', extensions: ['*'] }
                            ]
                        });

                        if (!result.canceled && result.filePaths.length > 0) {
                            mainWindow.webContents.send('menu-open-file', result.filePaths[0]);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Save Project',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        mainWindow.webContents.send('menu-save-project');
                    }
                },
                {
                    label: 'Save As...',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: async () => {
                        const result = await dialog.showSaveDialog(mainWindow, {
                            filters: [
                                { name: 'Music Blocks Files', extensions: ['ta', 'tb'] },
                                { name: 'HTML Files', extensions: ['html'] },
                                { name: 'All Files', extensions: ['*'] }
                            ]
                        });

                        if (!result.canceled) {
                            mainWindow.webContents.send('menu-save-as', result.filePath);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Export',
                    submenu: [
                        {
                            label: 'Export as MIDI',
                            click: () => {
                                mainWindow.webContents.send('menu-export-midi');
                            }
                        },
                        {
                            label: 'Export as PNG',
                            click: () => {
                                mainWindow.webContents.send('menu-export-png');
                            }
                        },
                        {
                            label: 'Export as SVG',
                            click: () => {
                                mainWindow.webContents.send('menu-export-svg');
                            }
                        },
                        {
                            label: 'Export as WAV',
                            click: () => {
                                mainWindow.webContents.send('menu-export-wav');
                            }
                        }
                    ]
                },
                { type: 'separator' },
                {
                    role: 'quit'
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Playback',
            submenu: [
                {
                    label: 'Play',
                    accelerator: 'Space',
                    click: () => {
                        mainWindow.webContents.send('menu-play');
                    }
                },
                {
                    label: 'Stop',
                    accelerator: 'Escape',
                    click: () => {
                        mainWindow.webContents.send('menu-stop');
                    }
                },
                {
                    label: 'Run Slowly',
                    click: () => {
                        mainWindow.webContents.send('menu-run-slowly');
                    }
                },
                {
                    label: 'Run Step by Step',
                    click: () => {
                        mainWindow.webContents.send('menu-run-step');
                    }
                }
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Statistics',
                    click: () => {
                        mainWindow.webContents.send('menu-statistics');
                    }
                },
                {
                    label: 'Load Plugin',
                    click: () => {
                        mainWindow.webContents.send('menu-load-plugin');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Beginner Mode',
                    type: 'checkbox',
                    checked: true,
                    click: (item) => {
                        mainWindow.webContents.send('menu-toggle-mode', item.checked ? 'beginner' : 'advanced');
                    }
                }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About Music Blocks',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Music Blocks',
                            message: 'Music Blocks',
                            detail: `Version: ${app.getVersion()}\n\nA musical microworld for learning programming through music.\n\nLearn more at: https://musicblocks.sugarlabs.org/`,
                            buttons: ['OK']
                        });
                    }
                },
                {
                    label: 'Learn More',
                    click: () => {
                        shell.openExternal('https://musicblocks.sugarlabs.org/');
                    }
                },
                {
                    label: 'Documentation',
                    click: () => {
                        shell.openExternal('https://github.com/sugarlabs/musicblocks/tree/master/documentation');
                    }
                }
            ]
        }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });

        // Window menu
        template[6].submenu = [
            { role: 'close' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
        ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC handlers for file operations
ipcMain.handle('save-file', async (event, filename, content) => {
    try {
        const result = await dialog.showSaveDialog(mainWindow, {
            defaultPath: filename,
            filters: [
                { name: 'Music Blocks Files', extensions: ['ta', 'tb'] },
                { name: 'HTML Files', extensions: ['html'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled) {
            fs.writeFileSync(result.filePath, content);
            return { success: true, filePath: result.filePath };
        }
        return { success: false, canceled: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return { success: true, content };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    // Kill server process
    if (serverProcess) {
        serverProcess.kill();
    }
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (url.startsWith('http://localhost:') || url.startsWith('http://127.0.0.1:')) {
        // Allow localhost
        event.preventDefault();
        callback(true);
    } else {
        callback(false);
    }
});
