/**
 * Hardware Button Support for Music Blocks
 * Implements chapter-like navigation using hardware buttons (headphones, keyboards, etc.)
 * This provides support for skipping between musical chunks/sections
 * 
 * @author Music Blocks Contributors
 * @version 1.0.0
 */

(function() {
    'use strict';

    // Global state management
    let currentChunkIndex = 0;
    let availableChunks = [];
    let isPlaying = false;
    let mediaSessionInitialized = false;
    let hardwareButtonSettings = {
        forwardAction: 'skipChapterForward',  // or 'fastForward'
        backwardAction: 'rewind',             // or 'skipChapterBack'
        fallbackEnabled: true
    };

    /**
     * Initialize hardware button support for Music Blocks
     */
    function initializeHardwareButtonSupport() {
        console.log('[Hardware Buttons] Initializing hardware button support for Music Blocks');
        
        // Initialize Media Session API for mobile/hardware buttons
        initializeMediaSession();
        
        // Set up keyboard shortcuts for desktop
        setupKeyboardShortcuts();
        
        // Enhance existing Electron integration
        enhanceElectronIntegration();
        
        // Listen for chunk/block changes
        setupChunkTracking();
        
        console.log('[Hardware Buttons] Hardware button support initialized');
    }

    /**
     * Initialize Media Session API for hardware button support
     */
    function initializeMediaSession() {
        if ('mediaSession' in navigator) {
            try {
                // Set up media metadata
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: 'Music Blocks Project',
                    artist: 'Music Blocks',
                    album: 'Visual Programming',
                    artwork: [
                        { src: 'activity/activity-icon-color-512.png', sizes: '512x512', type: 'image/png' }
                    ]
                });

                // Set up action handlers
                navigator.mediaSession.setActionHandler('play', handlePlayAction);
                navigator.mediaSession.setActionHandler('pause', handlePauseAction);
                navigator.mediaSession.setActionHandler('stop', handleStopAction);
                
                // Chapter navigation actions
                navigator.mediaSession.setActionHandler('nexttrack', handleNextChapterAction);
                navigator.mediaSession.setActionHandler('previoustrack', handlePreviousChapterAction);
                
                // Seek actions (fallback)
                navigator.mediaSession.setActionHandler('seekforward', handleSeekForwardAction);
                navigator.mediaSession.setActionHandler('seekbackward', handleSeekBackwardAction);

                mediaSessionInitialized = true;
                console.log('[Hardware Buttons] Media Session API initialized');
            } catch (error) {
                console.warn('[Hardware Buttons] Media Session API not fully supported:', error);
            }
        } else {
            console.warn('[Hardware Buttons] Media Session API not supported');
        }
    }

    /**
     * Set up keyboard shortcuts for hardware button simulation
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(event) {
            // Only handle shortcuts when not typing in input fields
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (event.code) {
                case 'MediaTrackNext':
                case 'ArrowRight':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        handleNextChapterAction();
                    }
                    break;

                case 'MediaTrackPrevious': 
                case 'ArrowLeft':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        handlePreviousChapterAction();
                    }
                    break;

                case 'MediaPlayPause':
                case 'Space':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        if (isPlaying) {
                            handlePauseAction();
                        } else {
                            handlePlayAction();
                        }
                    }
                    break;

                case 'MediaStop':
                case 'Escape':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        handleStopAction();
                    }
                    break;
            }
        });

        console.log('[Hardware Buttons] Keyboard shortcuts set up');
    }

    /**
     * Enhance existing Electron integration with chapter navigation
     */
    function enhanceElectronIntegration() {
        if (window.electronAPI && window.musicBlocksAPI) {
            // Add chapter navigation to existing menu actions
            const originalMenuHandler = window.electronAPI.onMenuAction;
            
            window.electronAPI.onMenuAction = function(callback) {
                const enhancedCallback = function(action, data) {
                    switch (action) {
                        case 'next-chapter':
                            handleNextChapterAction();
                            break;
                        case 'previous-chapter':
                            handlePreviousChapterAction();
                            break;
                        case 'skip-forward':
                            handleSeekForwardAction();
                            break;
                        case 'skip-backward':
                            handleSeekBackwardAction();
                            break;
                        default:
                            if (originalMenuHandler) {
                                originalMenuHandler(callback);
                            }
                            callback(action, data);
                    }
                };
                
                if (originalMenuHandler) {
                    originalMenuHandler(enhancedCallback);
                } else {
                    callback = enhancedCallback;
                }
            };

            console.log('[Hardware Buttons] Electron integration enhanced');
        }
    }

    /**
     * Set up tracking of chunks/sections in Music Blocks
     */
    function setupChunkTracking() {
        // Monitor for changes in the blocks or when projects are loaded
        if (window.globalActivity && window.globalActivity.blocks) {
            const activity = window.globalActivity;
            
            // Override the blocks loading to track chunks
            const originalLoadBlocks = activity.blocks.loadNewBlocks;
            activity.blocks.loadNewBlocks = function(...args) {
                const result = originalLoadBlocks.apply(this, args);
                updateAvailableChunks();
                return result;
            };

            // Monitor for new blocks being added
            const originalMakeNewBlock = activity.blocks.makeNewBlock;
            activity.blocks.makeNewBlock = function(...args) {
                const result = originalMakeNewBlock.apply(this, args);
                updateAvailableChunks();
                return result;
            };
        }

        // Set up periodic chunk discovery
        setInterval(updateAvailableChunks, 2000);
    }

    /**
     * Update the list of available chunks/sections
     */
    function updateAvailableChunks() {
        if (!window.globalActivity || !window.globalActivity.blocks) {
            return;
        }

        const blocks = window.globalActivity.blocks;
        const newChunks = [];

        // Find all "start" blocks and "action" blocks (chunks)
        for (let blockId = 0; blockId < blocks.blockList.length; blockId++) {
            const block = blocks.blockList[blockId];
            if (block && (block.name === 'start' || block.name === 'action' || block.name === 'chunk')) {
                newChunks.push({
                    id: blockId,
                    name: block.name,
                    label: block.value || `${block.name} ${blockId}`,
                    type: block.name
                });
            }
        }

        // Update chunks if they've changed
        if (JSON.stringify(newChunks) !== JSON.stringify(availableChunks)) {
            availableChunks = newChunks;
            updateMediaSessionMetadata();
            console.log(`[Hardware Buttons] Found ${availableChunks.length} chunks/sections`);
        }
    }

    /**
     * Update Media Session metadata with current chunk info
     */
    function updateMediaSessionMetadata() {
        if (!mediaSessionInitialized || availableChunks.length === 0) {
            return;
        }

        const currentChunk = availableChunks[currentChunkIndex];
        if (currentChunk && navigator.mediaSession) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentChunk.label || `Section ${currentChunkIndex + 1}`,
                artist: 'Music Blocks',
                album: `Project (${currentChunkIndex + 1}/${availableChunks.length})`,
                artwork: [
                    { src: 'activity/activity-icon-color-512.png', sizes: '512x512', type: 'image/png' }
                ]
            });
        }
    }

    /**
     * Action Handlers
     */

    function handlePlayAction() {
        console.log('[Hardware Buttons] Play action triggered');
        const playButton = document.getElementById('play');
        if (playButton) {
            playButton.click();
            isPlaying = true;
            updatePlaybackState('playing');
        }
    }

    function handlePauseAction() {
        console.log('[Hardware Buttons] Pause action triggered');
        const stopButton = document.getElementById('stop');
        if (stopButton) {
            stopButton.click();
            isPlaying = false;
            updatePlaybackState('paused');
        }
    }

    function handleStopAction() {
        console.log('[Hardware Buttons] Stop action triggered');
        const stopButton = document.getElementById('stop');
        if (stopButton) {
            stopButton.click();
            isPlaying = false;
            currentChunkIndex = 0;
            updatePlaybackState('none');
        }
    }

    function handleNextChapterAction() {
        console.log('[Hardware Buttons] Next chapter action triggered');
        
        if (hardwareButtonSettings.forwardAction === 'skipChapterForward') {
            skipToNextChunk();
        } else {
            // Fallback to fast forward
            handleSeekForwardAction();
        }
    }

    function handlePreviousChapterAction() {
        console.log('[Hardware Buttons] Previous chapter action triggered');
        
        if (hardwareButtonSettings.backwardAction === 'skipChapterBack') {
            skipToPreviousChunk();
        } else {
            // Fallback to rewind
            handleSeekBackwardAction();
        }
    }

    function handleSeekForwardAction() {
        console.log('[Hardware Buttons] Seek forward action triggered');
        
        // Implement fast forward (run slowly then resume normal speed)
        if (window.globalActivity && window.globalActivity.logo) {
            const logo = window.globalActivity.logo;
            if (logo.turtleDelay === 0) {
                logo.turtleDelay = 10; // Slow down briefly
                setTimeout(() => {
                    logo.turtleDelay = 0; // Resume normal speed
                }, 1000);
            }
        }
    }

    function handleSeekBackwardAction() {
        console.log('[Hardware Buttons] Seek backward action triggered');
        
        // Implement rewind by restarting current section
        restartCurrentChunk();
    }

    /**
     * Chapter/Chunk Navigation Functions
     */

    function skipToNextChunk() {
        if (availableChunks.length === 0) {
            console.log('[Hardware Buttons] No chunks available for navigation');
            if (hardwareButtonSettings.fallbackEnabled) {
                handleSeekForwardAction();
            }
            return;
        }

        currentChunkIndex = Math.min(currentChunkIndex + 1, availableChunks.length - 1);
        playCurrentChunk();
        
        // Show user feedback
        showChapterFeedback(`Playing: ${availableChunks[currentChunkIndex].label}`);
    }

    function skipToPreviousChunk() {
        if (availableChunks.length === 0) {
            console.log('[Hardware Buttons] No chunks available for navigation');
            if (hardwareButtonSettings.fallbackEnabled) {
                handleSeekBackwardAction();
            }
            return;
        }

        currentChunkIndex = Math.max(currentChunkIndex - 1, 0);
        playCurrentChunk();
        
        // Show user feedback
        showChapterFeedback(`Playing: ${availableChunks[currentChunkIndex].label}`);
    }

    function playCurrentChunk() {
        if (!window.globalActivity || availableChunks.length === 0) {
            return;
        }

        const currentChunk = availableChunks[currentChunkIndex];
        const activity = window.globalActivity;
        
        // Stop current playback
        if (activity.logo && activity.turtles.running()) {
            activity.logo.doStopTurtles();
        }

        // Start playing the selected chunk
        setTimeout(() => {
            if (currentChunk.type === 'start') {
                // For start blocks, run the entire project
                activity._doFastButton();
            } else {
                // For action/chunk blocks, try to execute just that block
                if (activity.blocks && activity.blocks.blockList[currentChunk.id]) {
                    activity.blocks.activeBlock = currentChunk.id;
                    activity.logo.runLogoCommands(currentChunk.id);
                }
            }
            
            isPlaying = true;
            updatePlaybackState('playing');
            updateMediaSessionMetadata();
        }, 200);
    }

    function restartCurrentChunk() {
        if (availableChunks.length > 0) {
            playCurrentChunk();
            showChapterFeedback(`Restarting: ${availableChunks[currentChunkIndex].label}`);
        } else {
            // Fallback: restart the entire project
            if (window.globalActivity) {
                window.globalActivity._doFastButton();
                showChapterFeedback('Restarting project');
            }
        }
    }

    /**
     * UI and State Management
     */

    function updatePlaybackState(state) {
        if (navigator.mediaSession) {
            navigator.mediaSession.playbackState = state;
        }
    }

    function showChapterFeedback(message) {
        // Create or update a temporary feedback element
        let feedbackEl = document.getElementById('chapter-feedback');
        if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            feedbackEl.id = 'chapter-feedback';
            feedbackEl.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                z-index: 10000;
                font-family: sans-serif;
                font-size: 14px;
                pointer-events: none;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(feedbackEl);
        }

        feedbackEl.textContent = message;
        feedbackEl.style.opacity = '1';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (feedbackEl) {
                feedbackEl.style.opacity = '0';
                setTimeout(() => {
                    if (feedbackEl && feedbackEl.parentNode) {
                        feedbackEl.parentNode.removeChild(feedbackEl);
                    }
                }, 300);
            }
        }, 3000);
    }

    /**
     * Settings Management
     */

    function updateHardwareButtonSettings(newSettings) {
        Object.assign(hardwareButtonSettings, newSettings);
        localStorage.setItem('musicBlocks_hardwareButtonSettings', JSON.stringify(hardwareButtonSettings));
        console.log('[Hardware Buttons] Settings updated:', hardwareButtonSettings);
    }

    function loadHardwareButtonSettings() {
        try {
            const saved = localStorage.getItem('musicBlocks_hardwareButtonSettings');
            if (saved) {
                Object.assign(hardwareButtonSettings, JSON.parse(saved));
            }
        } catch (error) {
            console.warn('[Hardware Buttons] Could not load settings:', error);
        }
    }

    /**
     * Public API
     */
    window.MusicBlocksHardwareButtons = {
        init: initializeHardwareButtonSupport,
        skipToNextChunk: skipToNextChunk,
        skipToPreviousChunk: skipToPreviousChunk,
        updateSettings: updateHardwareButtonSettings,
        getCurrentChunk: () => availableChunks[currentChunkIndex],
        getAvailableChunks: () => [...availableChunks],
        isSupported: () => 'mediaSession' in navigator || window.electronAPI
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadHardwareButtonSettings();
            initializeHardwareButtonSupport();
        });
    } else {
        loadHardwareButtonSettings();
        initializeHardwareButtonSupport();
    }

})();
