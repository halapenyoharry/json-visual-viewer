"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const panel_1 = require("./panel");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('json-visual-viewer.open', () => {
        panel_1.JsonViewerPanel.createOrShow(context.extensionUri);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('json-visual-viewer.viewCurrent', () => {
        const editor = vscode.window.activeTextEditor;
        panel_1.JsonViewerPanel.createOrShow(context.extensionUri);
        if (editor) {
            panel_1.JsonViewerPanel.currentPanel?.postJson(editor.document.getText());
        }
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map