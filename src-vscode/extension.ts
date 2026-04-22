import * as vscode from 'vscode';
import { JsonViewerPanel } from './panel';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('json-visual-viewer.open', () => {
      JsonViewerPanel.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('json-visual-viewer.viewCurrent', () => {
      const editor = vscode.window.activeTextEditor;
      JsonViewerPanel.createOrShow(context.extensionUri);
      if (editor) {
        JsonViewerPanel.currentPanel?.postJson(editor.document.getText());
      }
    })
  );
}

export function deactivate(): void {}
