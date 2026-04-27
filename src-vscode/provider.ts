import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class JsonVisualViewerProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'json-visual-viewer.editor';

  constructor(private readonly extensionUri: vscode.Uri) {}

  public resolveCustomTextEditor(
    document: vscode.TextDocument,
    panel: vscode.WebviewPanel
  ): void {
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist-webview')],
    };
    panel.webview.html = this.buildHtml(panel.webview);

    let lastEditFromWebview: string | null = null;

    const docSub = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() !== document.uri.toString()) return;
      const text = document.getText();
      if (text === lastEditFromWebview) return;
      panel.webview.postMessage({ type: 'setJson', json: text });
    });

    const msgSub = panel.webview.onDidReceiveMessage((msg: { type?: string; json?: string }) => {
      if (msg?.type === 'ready') {
        panel.webview.postMessage({ type: 'setJson', json: document.getText() });
        return;
      }
      if (msg?.type === 'edit' && typeof msg.json === 'string') {
        if (msg.json === document.getText()) return;
        lastEditFromWebview = msg.json;
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
          0,
          0,
          document.lineCount,
          document.lineAt(Math.max(0, document.lineCount - 1)).range.end.character
        );
        edit.replace(document.uri, fullRange, msg.json);
        vscode.workspace.applyEdit(edit);
      }
    });

    panel.onDidDispose(() => {
      docSub.dispose();
      msgSub.dispose();
    });
  }

  private buildHtml(webview: vscode.Webview): string {
    const distUri = vscode.Uri.joinPath(this.extensionUri, 'dist-webview');
    const indexPath = path.join(distUri.fsPath, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    html = html.replace(/(src|href)="(\.\/[^"]+)"/g, (_match, attr, relPath) => {
      const uri = webview.asWebviewUri(
        vscode.Uri.joinPath(distUri, relPath.slice(2))
      );
      return `${attr}="${uri}"`;
    });

    const csp = [
      `default-src 'none'`,
      `img-src ${webview.cspSource} data: blob:`,
      `script-src 'unsafe-eval' ${webview.cspSource} blob:`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `font-src ${webview.cspSource} data:`,
      `worker-src ${webview.cspSource} blob:`,
    ].join('; ');

    html = html.replace(
      '<head>',
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}">`
    );

    return html;
  }
}
