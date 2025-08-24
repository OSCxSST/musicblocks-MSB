/**
 * MusicBlocks v3.6.2
 *
 * @author GitHub Copilot
 *
 * @copyright 2025 GitHub Copilot
 *
 * @license
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Creates a grid-based instrument selector modal dialog
 * This replaces the radial wheel interface with a grid layout for better readability and mobile responsiveness
 */

const instrumentSelectorModal = (block, voiceLabels, voiceValues, categories, voice, rotate) => {
    // Prevent multiple dialogs
    if (block.blocks.stageClick) {
        return;
    }

    // Create the modal overlay
    const modal = document.createElement('div');
    modal.id = 'instrumentSelectorModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;

    // Create the dialog container
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        padding: 20px;
        max-width: 90vw;
        max-height: 90vh;
        overflow: auto;
        position: relative;
        min-width: 600px;
        min-height: 500px;
    `;

    // Create the header
    const header = document.createElement('div');
    header.style.cssText = `
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e0e0e0;
    `;
    header.innerHTML = '<h2 style="margin: 0; color: #333; font-size: 24px;">Select Instrument</h2>';

    // Create the instruments grid container
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
        justify-content: center;
        align-items: center;
        padding: 20px;
        border: 2px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
        position: relative;
        min-height: 350px;
    `;

    // Create close button in the center
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid #666;
        background: white;
        color: #666;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
    `;

    closeButton.onmouseover = () => {
        closeButton.style.background = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.borderColor = '#f44336';
    };

    closeButton.onmouseout = () => {
        closeButton.style.background = 'white';
        closeButton.style.color = '#666';
        closeButton.style.borderColor = '#666';
    };

    // Color mapping for different instrument categories
    const COLORS = ["#00ACC1", "#4CAF50", "#008BA3", "#FF9800", "#9C27B0", "#E91E63", "#795548"];
    
    // Create instrument buttons
    voiceLabels.forEach((label, index) => {
        const button = document.createElement('button');
        const categoryColor = COLORS[categories[index] % COLORS.length];
        
        button.style.cssText = `
            padding: 12px 8px;
            border: 2px solid ${categoryColor};
            border-radius: 8px;
            background: ${categoryColor}20;
            color: #333;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            word-wrap: break-word;
            line-height: 1.2;
        `;

        button.textContent = label;

        // Highlight current selection
        if (voiceValues[index] === voice) {
            button.style.background = categoryColor;
            button.style.color = 'white';
            button.style.fontWeight = 'bold';
        }

        button.onmouseover = () => {
            if (voiceValues[index] !== voice) {
                button.style.background = categoryColor;
                button.style.color = 'white';
                button.style.transform = 'scale(1.05)';
            }
        };

        button.onmouseout = () => {
            if (voiceValues[index] !== voice) {
                button.style.background = categoryColor + '20';
                button.style.color = '#333';
                button.style.transform = 'scale(1)';
            }
        };

        button.onclick = () => {
            selectInstrument(index);
        };

        gridContainer.appendChild(button);
    });

    gridContainer.appendChild(closeButton);

    // Selection handling
    const selectInstrument = (index) => {
        const selectedVoice = voiceValues[index];
        const selectedLabel = voiceLabels[index];

        // Update block value and text
        block.value = selectedVoice;
        block.text.text = selectedLabel;

        // Load synth
        if (getDrumName && getDrumName(selectedVoice) === null) {
            block.activity.logo.synth.loadSynth(0, getVoiceSynthName(selectedVoice));
        } else if (getDrumSynthName) {
            block.activity.logo.synth.loadSynth(0, getDrumSynthName(selectedVoice));
        }

        // Make sure text is on top
        block.container.setChildIndex(block.text, block.container.children.length - 1);
        block.updateCache();

        // Preview the instrument
        previewInstrument(selectedVoice);

        // Close modal
        closeModal();
    };

    // Preview functionality
    const previewInstrument = (selectedVoice) => {
        let timeout = 0;
        const tur = block.activity.turtles.ithTurtle(0);

        if (
            tur.singer.instrumentNames.length === 0 ||
            !tur.singer.instrumentNames.includes(selectedVoice)
        ) {
            tur.singer.instrumentNames.push(selectedVoice);
            if (selectedVoice === 'electronic synth') { // DEFAULTVOICE
                block.activity.logo.synth.createDefaultSynth(0);
            }

            block.activity.logo.synth.loadSynth(0, selectedVoice);
            timeout = 500; // give the synth time to load
        }

        setTimeout(() => {
            if (typeof Singer !== 'undefined' && Singer.setSynthVolume) {
                Singer.setSynthVolume(block.activity.logo, 0, selectedVoice, 0.5); // DEFAULTVOLUME
            }
            block.activity.logo.synth.trigger(0, "G4", 1 / 4, selectedVoice, null, null, false);
            block.activity.logo.synth.start();
        }, timeout);
    };

    // Close modal function
    const closeModal = () => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        
        // Set exit time for compatibility
        block._piemenuExitTime = new Date().getTime();
    };

    // Close button functionality
    closeButton.onclick = closeModal;

    // Close on overlay click
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };

    // Close on Escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Assemble the modal
    dialog.appendChild(header);
    dialog.appendChild(gridContainer);
    modal.appendChild(dialog);

    // Add to DOM
    document.body.appendChild(modal);

    // Focus for keyboard accessibility
    modal.focus();
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { instrumentSelectorModal };
}
