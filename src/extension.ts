'use strict';
// Import the module 'vscode' containing the VS Code extensibility API
import * as vscode from 'vscode';

// this method is called when your extension is activated - the first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "copy/paste-history" is now active!');

    var clipboardArray = new Array;    
    var disposableArray = [];
    var toBeRemoved = false;

    // Save all values that are copied to clipboard in array
    function addClipboardItem(editor:vscode.TextEditor) {
        let doc:vscode.TextDocument = editor.document;
        // TODO add full line cut and copy
        let text = doc.getText(new vscode.Range(editor.selection.start,editor.selection.end));
        clipboardArray.push(text);
    }    

    function makeQuickPick(clipboardArray, item?:vscode.QuickPickItem) {
        // Create quick pick clipboard items
        var options:vscode.QuickPickOptions = {placeHolder: "Clipboard", matchOnDescription: true, matchOnDetail: true};
        var copiedItems:vscode.QuickPickItem[] = [{label:"-",description:"Clear History"}];
        
        if (toBeRemoved) {
           clipboardArray = removeQuickPick(clipboardArray, item);
        }
        // List clipboard items in order of recency
        for (var i = 0; i < clipboardArray.length; i++) {
            copiedItems.unshift({label:(i+1).toString(), description:clipboardArray[i]});
        }
        
        return copiedItems;
    }

    function removeQuickPick(clipboardArray, item: vscode.QuickPickItem) {
        console.log(item);
        console.log(item.description);
        console.log(item.label);
        let index = parseInt(item.label) - 1;
        console.log(index)
        if (index > -1) {
            clipboardArray.splice(index, 1);
        }
        toBeRemoved = false;
        return clipboardArray;
    }

    // Called by pasteFromClipboard command
    // Paste item if selected from options list
    function pasteSelected(item: vscode.QuickPickItem) {
        let activeEditor
        if (activeEditor = vscode.window.activeTextEditor) {    // Don't run if no active text editor instance available
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

    disposableArray.push(vscode.commands.registerCommand('extension.copy', () => {
        addClipboardItem(vscode.window.activeTextEditor);
        vscode.commands.executeCommand("editor.action.clipboardCopyAction");
    }));

    disposableArray.push(vscode.commands.registerCommand('extension.cut', () => {
        addClipboardItem(vscode.window.activeTextEditor);
        vscode.commands.executeCommand("editor.action.clipboardCutAction");
    }));

    disposableArray.push(vscode.commands.registerCommand('extension.paste', () => {
        vscode.commands.executeCommand("editor.action.clipboardPasteAction");
    }));

    disposableArray.push(vscode.commands.registerCommand('extension.pasteFromClipboard', () => {
        if (clipboardArray.length == 0) { 
            vscode.window.showInformationMessage("No items in clipboard");
            return; 
        } else {
            vscode.window.showQuickPick(makeQuickPick(clipboardArray)).then((item) => {
                console.log(item)
                if (item.label === "-" && item.description === "Clear History") {
                    clipboardArray = [];    // Clear clipboard history if selected
                    return;
                } else { pasteSelected(item) }
        })}

    }));

    disposableArray.push(vscode.commands.registerCommand('extension.removeFromClipboard', () => {
        vscode.window.showQuickPick(makeQuickPick(clipboardArray)).then((item)=>{
            console.log(item.description);
            console.log(clipboardArray);
            toBeRemoved = true;
            vscode.window.showQuickPick(makeQuickPick(clipboardArray, item));
            vscode.window.setStatusBarMessage("removed from clipboard!");
            console.log(clipboardArray);
        });
    }));

    context.subscriptions.concat(disposableArray);
}

// Called when extension is deactivated
export function deactivate() {
}