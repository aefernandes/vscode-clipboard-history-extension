'use strict';
import {ExtensionContext, TextEditor, TextDocument, Range, Position, QuickPickOptions, QuickPickItem, window, commands} from 'vscode';

export function activate(context: ExtensionContext) {
    var clipboardArray = [];    
    var disposableArray = [];

    // Save all values that are copied to clipboard in array
    function addClipboardItem(editor: TextEditor) {
        let doc: TextDocument = editor.document;
        let sels = editor.selections;
        for (var i = 0; i < sels.length; i++) {
            let line = sels[i].active.line;
            let text = doc.getText(new Range(sels[i].start, sels[i].end));
            if (sels[i].isEmpty) { // Get full line if no selection highlighted
                let lineStart = new Position(line, 0);
                let lineEnd = new Position(line, doc.lineAt(line).range.end.character)
                text = doc.getText(new Range(lineStart, lineEnd));
            }
            clipboardArray.push(text);
        }
    }    

    function makeQuickPick(clipboardArray, toBeRemoved?: boolean) {
        // Create quick pick clipboard items
        var options: QuickPickOptions = {placeHolder: "Clipboard", matchOnDescription: true, matchOnDetail: true};
        var copiedItems: QuickPickItem[] = [];
        // Add clear all history option if making removal quick pick
        if (toBeRemoved && clipboardArray.length > 0) { copiedItems.push({ label: "0", description: "Clear All History" }); }
        // List clipboard items in order of recency
        for (var i = 0; i < clipboardArray.length; i++) {
            copiedItems.unshift({label:(i+1).toString(), description:clipboardArray[i]});
        }
        return copiedItems;
    }

    function removeQuickPickItem(clipboardArray, item: QuickPickItem) {
        let index = parseInt(item.label) - 1;
        if (index > -1) { clipboardArray.splice(index, 1); }
        return clipboardArray;
    }

    function editQuickPickItem(clipboardArray, item: QuickPickItem, text: string) {
        let index = parseInt(item.label) - 1;
        if (index > -1) {clipboardArray[index] = text; }
        return clipboardArray;
    }

    function pasteSelected(item: QuickPickItem) {
        let activeEditor
        if (activeEditor = window.activeTextEditor) {    // Don't run if no active text editor instance available
            let text = item.description;
            activeEditor.edit(function (textInserter) {
                textInserter.delete(activeEditor.selection);    // Delete anything currently selected
            }).then(function () {
                activeEditor.edit(function (textInserter) {
                    textInserter.insert(activeEditor.selection.start, text)     // Insert text from list
                })
            })  
        }         
    }

    disposableArray.push(commands.registerCommand('extension.copy', () => {
        addClipboardItem(window.activeTextEditor);
        commands.executeCommand("editor.action.clipboardCopyAction");
    }));

    disposableArray.push(commands.registerCommand('extension.cut', () => {
        addClipboardItem(window.activeTextEditor);
        commands.executeCommand("editor.action.clipboardCutAction");
    }));

    disposableArray.push(commands.registerCommand('extension.paste', () => {
        commands.executeCommand("editor.action.clipboardPasteAction");
    }));

    disposableArray.push(commands.registerCommand('extension.pasteFromClipboard', () => {
        if (clipboardArray.length == 0) { 
            window.setStatusBarMessage("No items in clipboard");
            window.showQuickPick(makeQuickPick(clipboardArray));
            return; 
        } else {
            window.showQuickPick(makeQuickPick(clipboardArray)).then((item) => { pasteSelected(item); });
        }
    }));

    disposableArray.push(commands.registerCommand('extension.removeFromClipboard', () => {
        if (clipboardArray.length == 0) {
            window.setStatusBarMessage("No items in clipboard");
            window.showQuickPick(makeQuickPick(clipboardArray));
            return;
        } else {
            let currentQuickPick = makeQuickPick(clipboardArray, true);
            window.showQuickPick(currentQuickPick).then((item)=>{
                if (item.label === "0" && item.description === "Clear All History") {
                    clipboardArray = [];    // Clear clipboard history if selected
                    window.setStatusBarMessage("Clipboard history cleared");
                    return;
                } else {
                    let removedQuickPick = makeQuickPick(removeQuickPickItem(clipboardArray, item), true);
                    window.setStatusBarMessage("Removed from clipboard");
                }
            });
        }
    }));
    
    disposableArray.push(commands.registerCommand('extension.editClipboard', () => {
        if (clipboardArray.length == 0) {
            window.setStatusBarMessage("No items in clipboard");
            return;
        } else {
            let currentQuickPick = makeQuickPick(clipboardArray);
            window.showQuickPick(currentQuickPick).then((item) => {
                let text = item.description;
                window.showInputBox({ value: item.description.toString() })
                    .then(val => {
                        let editedQuickPick = makeQuickPick(editQuickPickItem(clipboardArray, item, val));
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