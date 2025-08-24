/**
 * Test file for the new instrument selector
 * This creates a mock block object to test the new grid-based instrument selector
 */

// Mock data for testing
const mockVoiceLabels = [
    "Piano", "Guitar", "Violin", "Flute", "Drum", "Bass",
    "Saxophone", "Trumpet", "Cello", "Clarinet", "Harmonica", "Oboe"
];

const mockVoiceValues = [
    "piano", "guitar", "violin", "flute", "drum", "bass",
    "saxophone", "trumpet", "cello", "clarinet", "harmonica", "oboe"
];

const mockCategories = [0, 1, 1, 2, 3, 1, 2, 2, 1, 2, 2, 2]; // Different categories

// Mock block object
const mockBlock = {
    blocks: {
        stageClick: false
    },
    value: "piano",
    text: {
        text: "Piano"
    },
    container: {
        setChildIndex: function(child, index) {
            console.log("setChildIndex called");
        },
        children: {
            length: 1
        }
    },
    updateCache: function() {
        console.log("updateCache called");
    },
    activity: {
        logo: {
            synth: {
                loadSynth: function(turtle, voice) {
                    console.log(`Loading synth: ${voice}`);
                },
                createDefaultSynth: function(turtle) {
                    console.log("Creating default synth");
                },
                trigger: function(turtle, note, duration, voice, a, b, c) {
                    console.log(`Playing note: ${note} with voice: ${voice}`);
                },
                start: function() {
                    console.log("Starting synth");
                }
            }
        },
        turtles: {
            ithTurtle: function(index) {
                return {
                    singer: {
                        instrumentNames: []
                    }
                };
            }
        }
    },
    _piemenuExitTime: null
};

// Mock global functions
if (typeof getDrumName === 'undefined') {
    window.getDrumName = function(voice) {
        return voice.includes('drum') ? voice : null;
    };
}

if (typeof getVoiceSynthName === 'undefined') {
    window.getVoiceSynthName = function(voice) {
        return voice;
    };
}

if (typeof getDrumSynthName === 'undefined') {
    window.getDrumSynthName = function(voice) {
        return voice;
    };
}

if (typeof Singer === 'undefined') {
    window.Singer = {
        setSynthVolume: function(logo, turtle, voice, volume) {
            console.log(`Setting volume for ${voice}: ${volume}`);
        }
    };
}

if (typeof DEFAULTVOICE === 'undefined') {
    window.DEFAULTVOICE = 'electronic synth';
}

if (typeof DEFAULTVOLUME === 'undefined') {
    window.DEFAULTVOLUME = 0.5;
}

// Test function
function testInstrumentSelector() {
    if (typeof instrumentSelectorModal === 'undefined') {
        console.error('instrumentSelectorModal function not found!');
        alert('The instrument selector function is not available. Make sure piemenus.js is loaded.');
        return;
    }
    
    console.log('Testing instrument selector...');
    instrumentSelectorModal(mockBlock, mockVoiceLabels, mockVoiceValues, mockCategories, "piano", 0);
}

// Add test button to page if we're in a browser environment
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        const testButton = document.createElement('button');
        testButton.textContent = 'Test Instrument Selector';
        testButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 10001;
            font-size: 16px;
        `;
        testButton.onclick = testInstrumentSelector;
        document.body.appendChild(testButton);
    });
}

console.log('Test functions loaded. You can call testInstrumentSelector() to test the new interface.');
