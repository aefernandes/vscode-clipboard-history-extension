<h1 align="center">
  <br>
  VS Code - Clipboard History Extension
  <br>
  <br>
    <img src="https://github.com/aefernandes/vscode-copypaste-history-extension/blob/master/images/logo.png" alt="logo" width="200">
  <br>
</h1>
<h4 align="center">Keep a history of your copied and cut items and re-paste if needed.</h4>

-----------------------------------------------------------------------------------------------------------

## Key Features

1. Save history of all copied and cut items
2. Paste from history
3. Clear all history
4. Remove selected item from history
5. Edit selected item in history
  

## Demos
### Saving to and Pasting from Clipboard History
<br>
    <img src="https://github.com/aefernandes/vscode-copypaste-history-extension/blob/master/images/demo-1.gif" alt="demo-1">
  <br>

### Erasing from Clipboard History
<br>
    <img src="https://github.com/aefernandes/vscode-copypaste-history-extension/blob/master/images/demo-2.gif" alt="demo-2">
  <br>
  
### Editing Clipboard History
  <br>
    <img src="https://github.com/aefernandes/vscode-copypaste-history-extension/blob/master/images/demo-3.gif" alt="demo-3">
  <br>

## Keyboard Shortcuts

**Type Clipboard in the command palette to view all commands.**

`Ctrl+C` copies and `Ctrl+X ` cuts the selected item. These override the default shortcuts to save the item to clipboard. If nothing is selected, the entire line will be saved. 

`Ctrl+V` pastes the most recent item.

`Ctrl+Shift+V` opens the clipboard history. Use the arrow keys to scroll and press Enter to paste a selected item. 

`Ctrl+Alt+V D` opens the clipboard delete settings. Use the arrow keys to scroll and press Enter to remove a selected item. The "Clear History" option will erase all items from history.

`Ctrl+Alt+V E` opens the clipboard editor settings. Use the arrow keys to scroll and press Enter to edit a selected item. 

You can also add custom keyboard short cuts by following the instructions in the [customization documentation](https://code.visualstudio.com/docs/customization/keybindings).

-----------------------------------------------------------------------------------------------------------