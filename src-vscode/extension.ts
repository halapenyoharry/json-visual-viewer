import * as vscode from 'vscode';
import { JsonVisualViewerProvider } from './provider';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      JsonVisualViewerProvider.viewType,
      new JsonVisualViewerProvider(context.extensionUri),
      {
        webviewOptions: { retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false,
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'json-visual-viewer.viewCurrent',
      async (uri?: vscode.Uri) => {
        const target = uri ?? vscode.window.activeTextEditor?.document.uri;
        if (!target) {
          vscode.window.showWarningMessage('No JSON file selected.');
          return;
        }
        await vscode.commands.executeCommand(
          'vscode.openWith',
          target,
          JsonVisualViewerProvider.viewType,
          vscode.ViewColumn.Beside
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('json-visual-viewer.browse', async () => {
      const files = await vscode.workspace.findFiles(
        '**/*.json',
        '**/{node_modules,dist,dist-extension,dist-webview,.git,_archive}/**',
        500
      );
      if (files.length === 0) {
        vscode.window.showInformationMessage('No JSON files found in this workspace.');
        return;
      }
      const folders = vscode.workspace.workspaceFolders ?? [];
      const items: (vscode.QuickPickItem & { uri: vscode.Uri })[] = files
        .map((uri) => {
          const rel = vscode.workspace.asRelativePath(uri, folders.length > 1);
          const slash = rel.lastIndexOf('/');
          return {
            uri,
            label: slash >= 0 ? rel.slice(slash + 1) : rel,
            description: slash >= 0 ? rel.slice(0, slash) : '',
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));

      const picked = await vscode.window.showQuickPick(items, {
        title: 'JSON Visual Viewer — pick a file',
        matchOnDescription: true,
        placeHolder: 'Type to filter…',
      });
      if (!picked) return;
      await vscode.commands.executeCommand(
        'vscode.openWith',
        picked.uri,
        JsonVisualViewerProvider.viewType,
        vscode.ViewColumn.Beside
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('json-visual-viewer.open', async () => {
      const doc = await vscode.workspace.openTextDocument({
        language: 'json',
        content: '{}\n',
      });
      await vscode.commands.executeCommand(
        'vscode.openWith',
        doc.uri,
        JsonVisualViewerProvider.viewType
      );
    })
  );
}

export function deactivate(): void {}
