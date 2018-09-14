'use strict';
import {
    ExtensionContext, 
    workspace, 
    TextEditor, 
    TextDocument, 
    Range, 
    Position, 
    QuickPickOptions, 
    QuickPickItem, 
    window, 
    commands,
} from 'vscode';

export function activate(context: ExtensionContext) {
    let config = workspace.getConfiguration('clipboard');
    let clipboardSize = config.get('size', 12);
    var clipboardArray = [];    
    var disposableArray = [];

    // Save all values that are copied to clipboard in array
    function addClipboardItem(editor: TextEditor) {
        const doc: TextDocument = editor.document;
        const sels = editor.selections;
        for (var i = 0; i < sels.length; i++) {
            const line = sels[i].active.line;
            let text = doc.getText(new Range(sels[i].start, sels[i].end));
            if (sels[i].isEmpty) { // Get full line if no selection highlighted
                let lineStart = new Position(line, 0);
                let lineEnd = new Position(line, doc.lineAt(line).range.end.character);
                text = doc.getText(new Range(lineStart, lineEnd));
            }
            
            if (clipboardArray.indexOf(text) === -1) {
                clipboardArray.push(text);
                if (clipboardArray.length > clipboardSize) {
                    clipboardArray.shift();
                }
            }
        }
    }    

    function makeQuickPick(clipboardArray, toBeRemoved?: boolean) {
        const copiedItems: QuickPickItem[] = [];
        // Add clear all history option if making removal quick pick
        if (toBeRemoved && clipboardArray.length > 0) {
            copiedItems.push({ 
                label: "", 
                description: "Clear All History",
            }); 
        }
        // List clipboard items in order of recency
        for (var i = 0; i < clipboardArray.length; i++) {
            copiedItems.unshift({
                label:"", 
                description:clipboardArray[i],
            });
        }
        return copiedItems;
    }

    function removeQuickPickItem(clipboardArray, item: QuickPickItem) {
        const index = clipboardArray.indexOf(item.description);
        if (index > -1) {
            clipboardArray.splice(index, 1);
        }
        return clipboardArray;
    }

    function editQuickPickItem(clipboardArray, item: QuickPickItem, text: string) {
        const index = clipboardArray.indexOf(item.description);
        if (index > -1) {
            clipboardArray[index] = text;
        }
        return clipboardArray;
    }

    function pasteSelected(item: QuickPickItem) {
        if(!item) return;

        const activeEditor = window.activeTextEditor;
        if (activeEditor) {    // Don't run if no active text editor instance available
            activeEditor.edit((textInserter) => {
                textInserter.delete(activeEditor.selection);    // Delete anything currently selected
            }).then(() => {
                activeEditor.edit((textInserter) => {
                    textInserter.insert(activeEditor.selection.start, item.description);     // Insert text from list
                    
                    clipboardArray.splice(clipboardArray.indexOf(item.description), 1);
                    clipboardArray.push(item.description);
                })
            })
        }
    }

    function pasteLastClipboardItem(activeEditor: TextEditor) {
        activeEditor.edit((textInserter) => {
            textInserter.delete(activeEditor.selection);    // Delete anything currently selected
        }).then(() => {
            activeEditor.edit((textInserter) => {
                const item = clipboardArray[clipboardArray.length - 1]
                textInserter.insert(activeEditor.selection.start, item);     // Insert text from list
            })
        })
    }

    disposableArray.push(commands.registerCommand('clipboard.copy', () => {
        addClipboardItem(window.activeTextEditor);
        commands.executeCommand("editor.action.clipboardCopyAction");
    }));

    disposableArray.push(commands.registerCommand('clipboard.cut', () => {
        addClipboardItem(window.activeTextEditor);
        commands.executeCommand("editor.action.clipboardCutAction");
    }));

    disposableArray.push(commands.registerCommand('clipboard.paste', () => {
        if(config.get('pasteBehavior') == 'keepLastPaste') {
            pasteLastClipboardItem(window.activeTextEditor);
        } else {
            commands.executeCommand("editor.action.clipboardPasteAction");
        }
    }));

    disposableArray.push(commands.registerCommand('clipboard.pasteFromClipboard', () => {
        if (clipboardArray.length == 0) { 
            window.setStatusBarMessage("No items in clipboard");
            window.showQuickPick(makeQuickPick(clipboardArray));
            return; 
        } else {
            window.showQuickPick(makeQuickPick(clipboardArray)).then((item) => { pasteSelected(item); });
        }
    }));

    disposableArray.push(commands.registerCommand('clipboard.removeFromClipboard', () => {
        if (clipboardArray.length == 0) {
            window.setStatusBarMessage("No items in clipboard");
            window.showQuickPick(makeQuickPick(clipboardArray));
            return;
        } else {
            const currentQuickPick = makeQuickPick(clipboardArray, true);
            window.showQuickPick(currentQuickPick).then((item) => {
                if (item.description === "Clear All History") {
                    clipboardArray = [];    // Clear clipboard history if selected
                    window.setStatusBarMessage("Clipboard history cleared");
                    return;
                } else {
                    makeQuickPick(removeQuickPickItem(clipboardArray, item), true);
                    window.setStatusBarMessage("Removed from clipboard");
                }
            });
        }
    }));
    
    disposableArray.push(commands.registerCommand('clipboard.editClipboard', () => {
        if (clipboardArray.length == 0) {
            window.setStatusBarMessage("No items in clipboard");
            return;
        } else {
            const currentQuickPick = makeQuickPick(clipboardArray);
            window.showQuickPick(currentQuickPick).then((item) => {
                window.showInputBox({ value: item.description.toString() })
                    .then((val) => {
                        makeQuickPick(editQuickPickItem(clipboardArray, item, val));
                        window.setStatusBarMessage("Edited clipboard item");
                    });
            })
        }
    }));

    context.subscriptions.concat(disposableArray);
}

// Called when extension is deactivated
export function deactivate() {
}
