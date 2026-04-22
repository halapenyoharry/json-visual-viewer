import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class JsonViewerPanel {
  public static currentPanel: JsonViewerPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri): void {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One;

    if (JsonViewerPanel.currentPanel) {
      JsonViewerPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'jsonVisualViewer',
      'JSON Visual Viewer',
      column,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist-webview')],
        retainContextWhenHidden: true,
      }
    );

    JsonViewerPanel.currentPanel = new JsonViewerPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._panel.webview.html = this._buildHtml();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public postJson(json: string): void {
    this._panel.webview.postMessage({ type: 'setJson', json });
  }

  private _buildHtml(): string {
    const distUri = vscode.Uri.joinPath(this._extensionUri, 'dist-webview');
    const indexPath = path.join(distUri.fsPath, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    // Rewrite relative ./path references to webview resource URIs.
    // Vite webview build outputs these with base './' so all asset refs are relative.
    html = html.replace(/(src|href)="(\.\/[^"]+)"/g, (_match, attr, relPath) => {
      const uri = this._panel.webview.asWebviewUri(
        vscode.Uri.joinPath(distUri, relPath.slice(2))
      );
      return `${attr}="${uri}"`;
    });

    // Content Security Policy — allow scripts/styles from the webview resource origin
    const csp = [
      `default-src 'none'`,
      `img-src ${this._panel.webview.cspSource} data: blob:`,
      `script-src 'unsafe-eval' ${this._panel.webview.cspSource}`,
      `style-src ${this._panel.webview.cspSource} 'unsafe-inline'`,
      `font-src ${this._panel.webview.cspSource} data:`,
      `worker-src blob:`,
    ].join('; ');

    html = html.replace(
      '<head>',
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}">`
    );

    return html;
  }

  public dispose(): void {
    JsonViewerPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }
}
