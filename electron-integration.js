/**
 * Music Blocks Electron Integration
 * This script provides integration between Music Blocks web app and Electron
 */

(function() {
    'use strict';

    // Check if running in Electron
    const isElectron = window.electronAPI && window.musicBlocksAPI;
    
    if (!isElectron) {
        console.log('[Music Blocks] Not running in Electron environment');
        return;
    }

    console.log('[Music Blocks] Electron integration loaded');

    // Enhanced offline capabilities
    if (window.musicBlocksAPI.offline.enabled) {
        // Override file operations for better desktop integration
        window.electronAPI.onMenuAction((action, data) => {
            console.log('[Music Blocks] Menu action:', action, data);
            
            switch (action) {
                case 'new-project':
                    if (typeof newProject === 'function') {
                        newProject();
                    } else {
                        console.warn('[Music Blocks] newProject function not available');
                    }
                    break;
                    
                case 'open-file':
                    if (data && typeof openProjectFromFile === 'function') {
                        openProjectFromFile(data);
                    } else if (typeof doLoad === 'function') {
                        doLoad();
                    }
                    break;
                    
                case 'save-project':
                    if (typeof doSave === 'function') {
                        doSave();
                    } else {
                        console.warn('[Music Blocks] doSave function not available');
                    }
                    break;
                    
                case 'save-as':
                    if (data && typeof saveProjectAs === 'function') {
                        saveProjectAs(data);
                    }
                    break;
                    
                case 'export-midi':
                    if (typeof doSaveMIDI === 'function') {
                        doSaveMIDI();
                    }
                    break;
                    
                case 'export-png':
                    if (typeof doSavePNG === 'function') {
                        doSavePNG();
                    }
                    break;
                    
                case 'export-svg':
                    if (typeof doSaveSVG === 'function') {
                        doSaveSVG();
                    }
                    break;
                    
                case 'export-wav':
                    if (typeof doSaveWAV === 'function') {
                        doSaveWAV();
                    }
                    break;
                    
                case 'play':
                    const playButton = document.getElementById('play');
                    if (playButton) {
                        playButton.click();
                    }
                    break;
                    
                case 'stop':
                    const stopButton = document.getElementById('stop');
                    if (stopButton) {
                        stopButton.click();
                    }
                    break;
                    
                case 'run-slowly':
                    const runSlowlyButton = document.getElementById('runSlowlyIcon');
                    if (runSlowlyButton) {
                        runSlowlyButton.click();
                    }
                    break;
                    
                case 'run-step':
                    const runStepButton = document.getElementById('runStepByStepIcon');
                    if (runStepButton) {
                        runStepButton.click();
                    }
                    break;
                    
                case 'statistics':
                    const statsButton = document.getElementById('displayStatsIcon');
                    if (statsButton) {
                        statsButton.click();
                    }
                    break;
                    
                case 'load-plugin':
                    const pluginButton = document.getElementById('loadPluginIcon');
                    if (pluginButton) {
                        pluginButton.click();
                    }
                    break;
                    
                case 'toggle-mode':
                    const beginnerBtn = document.getElementById('beginnerMode');
                    const advancedBtn = document.getElementById('advancedMode');
                    if (data === 'beginner' && beginnerBtn) {
                        beginnerBtn.click();
                    } else if (data === 'advanced' && advancedBtn) {
                        advancedBtn.click();
                    }
                    break;
                    
                case 'next-chapter':
                    if (window.MusicBlocksHardwareButtons) {
                        window.MusicBlocksHardwareButtons.skipToNextChunk();
                    }
                    break;
                    
                case 'previous-chapter':
                    if (window.MusicBlocksHardwareButtons) {
                        window.MusicBlocksHardwareButtons.skipToPreviousChunk();
                    }
                    break;
                    
                case 'skip-forward':
                    // Fast forward functionality
                    if (window.globalActivity && window.globalActivity.logo) {
                        const logo = window.globalActivity.logo;
                        if (logo.turtleDelay === 0) {
                            logo.turtleDelay = 10; // Slow down briefly to simulate fast forward
                            setTimeout(() => {
                                logo.turtleDelay = 0; // Resume normal speed
                            }, 1000);
                        }
                    }
                    break;
                    
                case 'skip-backward':
                    // Rewind functionality - restart current section
                    const rewindPlayButton = document.getElementById('play');
                    if (rewindPlayButton) {
                        const stopButton = document.getElementById('stop');
                        if (stopButton) stopButton.click();
                        setTimeout(() => rewindPlayButton.click(), 200);
                    }
                    break;
                    
                default:
                    console.warn('[Music Blocks] Unknown menu action:', action);
            }
        });

        // Enhanced file operations for Electron
        window.electronFileSave = async function(content, filename, format) {
            try {
                const result = await window.electronAPI.saveFile(filename, content);
                if (result.success) {
                    console.log('[Music Blocks] File saved successfully:', result.filePath);
                    return result.filePath;
                } else if (!result.canceled) {
                    console.error('[Music Blocks] File save failed:', result.error);
                    throw new Error(result.error);
                }
                return null;
            } catch (error) {
                console.error('[Music Blocks] Electron file save error:', error);
                throw error;
            }
        };

        window.electronFileLoad = async function(filePath) {
            try {
                const result = await window.electronAPI.readFile(filePath);
                if (result.success) {
                    console.log('[Music Blocks] File loaded successfully:', filePath);
                    return result.content;
                } else {
                    console.error('[Music Blocks] File load failed:', result.error);
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('[Music Blocks] Electron file load error:', error);
                throw error;
            }
        };

        // Override native file save functions when available
        if (typeof originalSaveFunction === 'undefined') {
            window.originalSaveFunction = window.save || function() {};
        }

        // Enhanced save function for Electron
        window.save = async function(content, filename, format) {
            if (window.electronAPI) {
                try {
                    return await window.electronFileSave(content, filename, format);
                } catch (error) {
                    console.warn('[Music Blocks] Electron save failed, falling back to web save:', error);
                    return window.originalSaveFunction(content, filename, format);
                }
            }
            return window.originalSaveFunction(content, filename, format);
        };

        // Add offline status indicator
        function addOfflineIndicator() {
            const indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.innerHTML = `
                <div style="
                    position: fixed;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #4CAF50;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 10000;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <span style="
                        width: 8px;
                        height: 8px;
                        background: white;
                        border-radius: 50%;
                        animation: pulse 2s infinite;
                    "></span>
                    <span>Desktop Mode - Enhanced Offline Support</span>
                </div>
                <style>
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                </style>
            `;
            document.body.appendChild(indicator);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.style.transition = 'opacity 0.5s ease';
                    indicator.style.opacity = '0';
                    setTimeout(() => {
                        if (indicator.parentNode) {
                            indicator.parentNode.removeChild(indicator);
                        }
                    }, 500);
                }
            }, 5000);
        }

        // Add keyboard shortcuts for Electron
        function addElectronKeyboardShortcuts() {
            document.addEventListener('keydown', function(e) {
                // Ctrl/Cmd + N - New Project
                if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                    e.preventDefault();
                    if (typeof newProject === 'function') {
                        newProject();
                    }
                }
                
                // Ctrl/Cmd + O - Open Project
                if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                    e.preventDefault();
                    if (typeof doLoad === 'function') {
                        doLoad();
                    }
                }
                
                // Ctrl/Cmd + S - Save Project
                if ((e.ctrlKey || e.metaKey) && e.key === 's' && !e.shiftKey) {
                    e.preventDefault();
                    if (typeof doSave === 'function') {
                        doSave();
                    }
                }
                
                // Ctrl/Cmd + Shift + S - Save As
                if ((e.ctrlKey || e.metaKey) && e.key === 's' && e.shiftKey) {
                    e.preventDefault();
                    // Trigger save as functionality
                    console.log('[Music Blocks] Save As triggered');
                }
                
                // Space - Play/Pause
                if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    const activeElement = document.activeElement;
                    if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                        e.preventDefault();
                        const playButton = document.getElementById('play');
                        if (playButton) {
                            playButton.click();
                        }
                    }
                }
                
                // Escape - Stop
                if (e.key === 'Escape') {
                    const stopButton = document.getElementById('stop');
                    if (stopButton) {
                        stopButton.click();
                    }
                }
            });
        }

        // Initialize Electron-specific features
        function initElectronFeatures() {
            console.log('[Music Blocks] Initializing Electron features');
            
            // Add offline indicator
            addOfflineIndicator();
            
            // Add keyboard shortcuts
            addElectronKeyboardShortcuts();
            
            // Disable web-based file system access prompts
            if (window.showDirectoryPicker) {
                window.showDirectoryPicker = undefined;
            }
            if (window.showOpenFilePicker) {
                window.showOpenFilePicker = undefined;
            }
            if (window.showSaveFilePicker) {
                window.showSaveFilePicker = undefined;
            }

            // Enhanced error handling
            window.addEventListener('error', function(e) {
                console.error('[Music Blocks] Runtime error:', e.error);
            });

            window.addEventListener('unhandledrejection', function(e) {
                console.error('[Music Blocks] Unhandled promise rejection:', e.reason);
            });
        }

        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initElectronFeatures);
        } else {
            initElectronFeatures();
        }

        // Expose Electron status to Music Blocks
        window.MUSICBLOCKS_ELECTRON = {
            isElectron: true,
            platform: window.electronAPI.platform,
            version: window.electronAPI.versions,
            offlineSupport: true,
            fileSystemAccess: true
        };
    }
})();
