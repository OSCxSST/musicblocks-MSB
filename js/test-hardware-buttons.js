/**
 * Test file for Hardware Button Support
 * Run this to verify the hardware button functionality works
 */

// Simple test to check if hardware button support loads correctly
function testHardwareButtonSupport() {
    console.log('🧪 Testing Hardware Button Support...');
    
    // Check if the class exists
    if (typeof HardwareButtonSupport === 'undefined') {
        console.error('❌ HardwareButtonSupport class not found');
        return false;
    }
    
    try {
        // Create an instance with minimal mock dependencies
        const mockActivityObject = {
            logo: {
                runLogoCommands: () => console.log('Mock logo command executed'),
                turtles: {
                    turtleList: []
                }
            },
            blocks: {
                blockList: [],
                loadNewBlocks: () => ({ chunks: [] }),
                findBlocks: () => []
            },
            stage: {
                update: () => console.log('Mock stage update')
            }
        };
        
        const hardwareButtons = new HardwareButtonSupport(mockActivityObject);
        console.log('✅ HardwareButtonSupport instance created successfully');
        
        // Test initialization
        hardwareButtons.initialize();
        console.log('✅ Hardware button support initialized');
        
        // Test chunk detection
        const chunks = hardwareButtons.detectAvailableChunks();
        console.log(`✅ Chunk detection works, found: ${chunks.length} chunks`);
        
        // Test media session support check
        const hasMediaSession = hardwareButtons.hasMediaSessionSupport();
        console.log(`✅ Media Session API support: ${hasMediaSession ? 'Available' : 'Not available'}`);
        
        console.log('🎉 All hardware button support tests passed!');
        return true;
        
    } catch (error) {
        console.error('❌ Hardware button support test failed:', error.message);
        return false;
    }
}

// Run the test when this file is loaded
if (typeof window !== 'undefined') {
    // Browser environment
    window.addEventListener('load', () => {
        setTimeout(testHardwareButtonSupport, 1000); // Wait for other scripts to load
    });
} else {
    // Node.js environment (won't work but won't crash)
    console.log('⚠️ This test requires a browser environment with DOM support');
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testHardwareButtonSupport };
}
