# Undo/Redo Feature for Music Blocks

## Overview

A comprehensive undo/redo system has been implemented in Music Blocks to provide users with better editing capabilities and improved user experience. This feature allows users to easily revert or restore changes made to their block arrangements.

## Features

### 1. Toolbar Buttons

-   **Undo Button**: Located in the auxiliary toolbar with a material design "undo" icon
-   **Redo Button**: Located in the auxiliary toolbar with a material design "redo" icon
-   Both buttons provide visual feedback (opacity changes) to indicate availability

### 2. Keyboard Shortcuts

-   **Ctrl+Z**: Undo the last action
-   **Ctrl+Y**: Redo the last undone action
-   **Ctrl+Shift+Z**: Alternative redo shortcut (common in many applications)

### 3. Action Tracking

The system automatically tracks the following operations:

-   **Block Creation**: Adding new blocks to the workspace
-   **Block Deletion**: Removing blocks (sending to trash)
-   **Block Movement**: Moving blocks around the workspace
-   **Block Connections**: Connecting and disconnecting blocks

### 4. Smart State Management

-   **Automatic State Saving**: States are saved before each significant operation
-   **Stack Size Limit**: Maximum of 50 undo states to prevent memory issues
-   **Redo Stack Clearing**: When a new action is performed, the redo stack is cleared
-   **Visual Feedback**: Buttons become disabled (grayed out) when no actions are available

## Technical Implementation

### Core Components

#### Activity Class Extensions

-   `undoStack[]`: Array storing previous states
-   `redoStack[]`: Array storing future states
-   `maxUndoStackSize`: Configurable limit (default: 50)
-   `saveStateForUndo()`: Captures current state
-   `_doUndo()`: Performs undo operation
-   `_doRedo()`: Performs redo operation
-   `_restoreState()`: Restores workspace from saved state
-   `_updateUndoRedoButtons()`: Updates UI button states

#### Toolbar Integration

-   Added undo/redo icons to HTML auxiliary toolbar
-   Created `renderUndoIcon()` and `renderRedoIcon()` methods in toolbar.js
-   Added tooltip support with keyboard shortcut hints

#### Block System Integration

-   Modified `sendStackToTrash()` to save state before deletion
-   Modified `makeNewBlock()` to save state before creation
-   Automatic integration with existing block operations

### State Serialization

The system uses the existing `prepareExport()` method to serialize the current workspace state, ensuring compatibility with the existing save/load infrastructure.

### Error Handling

-   Comprehensive try/catch blocks prevent crashes
-   Graceful fallback when operations fail
-   User-friendly error messages
-   Console logging for debugging

## Usage Instructions

### For Users

1. **Enable Auxiliary Toolbar**: Click the menu button to show additional tools
2. **Perform Actions**: Add, move, or delete blocks normally
3. **Undo Changes**: Click undo button or press Ctrl+Z
4. **Redo Changes**: Click redo button or press Ctrl+Y
5. **Visual Feedback**: Disabled buttons indicate no actions available

### For Developers

1. **Adding New Trackable Operations**: Call `this.activity.saveStateForUndo()` before operations that should be undoable
2. **Customizing Stack Size**: Modify `maxUndoStackSize` in Activity constructor
3. **Extending Functionality**: Add new keyboard shortcuts in `__keyPressed()` method

## File Changes

### Modified Files

1. **index.html**: Added undo/redo button HTML elements
2. **js/toolbar.js**: Added button rendering methods and tooltip strings
3. **js/activity.js**:
    - Added undo/redo system properties
    - Implemented core undo/redo methods
    - Added keyboard shortcut handling
    - Integrated toolbar button initialization
4. **js/blocks.js**:
    - Added state saving to key block operations
    - Integrated with deletion and creation workflows

### New Dependencies

-   Uses existing Material Design icons ("undo", "redo")
-   Leverages existing `prepareExport()` and `loadNewBlocks()` methods
-   Compatible with existing block management system

## Future Enhancements

### Possible Improvements

1. **Granular Undo**: Track individual block movements vs. full state saves
2. **Undo Categories**: Different types of undoable actions
3. **Persistent Undo**: Save undo history across sessions
4. **Visual Undo Preview**: Show preview of previous states
5. **Batch Operations**: Group related operations for single undo
6. **Performance Optimization**: More efficient state storage for large projects

### Integration Opportunities

1. **Widget Undo**: Extend to widgets like RhythmRuler (already partially implemented)
2. **Collaborative Undo**: Support for multi-user editing
3. **Timeline View**: Visual representation of action history
4. **Selective Undo**: Undo specific operations from history

## Testing

### Manual Test Cases

1. **Basic Operations**:

    - Create block → Undo → Verify block removed → Redo → Verify block restored
    - Delete block → Undo → Verify block restored → Redo → Verify block deleted
    - Move block → Undo → Verify original position → Redo → Verify new position

2. **Keyboard Shortcuts**:

    - Test Ctrl+Z, Ctrl+Y, and Ctrl+Shift+Z combinations
    - Verify shortcuts work in different contexts
    - Test during widget usage (should be disabled appropriately)

3. **Edge Cases**:

    - Test with empty workspace
    - Test with maximum stack size reached
    - Test rapid consecutive operations
    - Test during project load/save operations

4. **UI Feedback**:
    - Verify button states update correctly
    - Test tooltip display
    - Verify visual feedback (opacity changes)

### Automated Testing

Consider adding unit tests for:

-   State serialization/deserialization
-   Stack management (push/pop operations)
-   Keyboard shortcut handling
-   Button state updates

## Conclusion

The undo/redo feature significantly enhances the Music Blocks user experience by providing familiar editing capabilities found in professional applications. The implementation is robust, well-integrated with the existing codebase, and designed for extensibility.

Users can now experiment more freely with their musical compositions, knowing they can easily revert unwanted changes. This feature is particularly valuable for educational environments where students are learning and experimenting with block-based programming concepts.

The system is designed to be intuitive for users familiar with standard desktop applications while maintaining the friendly, accessible nature of Music Blocks.
