var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src-vscode/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode2 = __toESM(require("vscode"), 1);

// src-vscode/panel.ts
var vscode = __toESM(require("vscode"), 1);
var path = __toESM(require("path"), 1);
var fs = __toESM(require("fs"), 1);
var JsonViewerPanel = class _JsonViewerPanel {
  static currentPanel;
  _panel;
  _extensionUri;
  _disposables = [];
  static createOrShow(extensionUri) {
    const column = vscode.window.activeTextEditor ? vscode.ViewColumn.Beside : vscode.ViewColumn.One;
    if (_JsonViewerPanel.currentPanel) {
      _JsonViewerPanel.currentPanel._panel.reveal(column);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      "jsonVisualViewer",
      "JSON Visual Viewer",
      column,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "dist-webview")],
        retainContextWhenHidden: true
      }
    );
    _JsonViewerPanel.currentPanel = new _JsonViewerPanel(panel, extensionUri);
  }
  constructor(panel, extensionUri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._panel.webview.html = this._buildHtml();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }
  postJson(json) {
    this._panel.webview.postMessage({ type: "setJson", json });
  }
  _buildHtml() {
    const distUri = vscode.Uri.joinPath(this._extensionUri, "dist-webview");
    const indexPath = path.join(distUri.fsPath, "index.html");
    let html = fs.readFileSync(indexPath, "utf8");
    html = html.replace(/(src|href)="(\.\/[^"]+)"/g, (_match, attr, relPath) => {
      const uri = this._panel.webview.asWebviewUri(
        vscode.Uri.joinPath(distUri, relPath.slice(2))
      );
      return `${attr}="${uri}"`;
    });
    const csp = [
      `default-src 'none'`,
      `img-src ${this._panel.webview.cspSource} data: blob:`,
      `script-src 'unsafe-eval' ${this._panel.webview.cspSource}`,
      `style-src ${this._panel.webview.cspSource} 'unsafe-inline'`,
      `font-src ${this._panel.webview.cspSource} data:`,
      `worker-src blob:`
    ].join("; ");
    html = html.replace(
      "<head>",
      `<head>
    <meta http-equiv="Content-Security-Policy" content="${csp}">`
    );
    return html;
  }
  dispose() {
    _JsonViewerPanel.currentPanel = void 0;
    this._panel.dispose();
    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }
};

// src-vscode/extension.ts
function activate(context) {
  context.subscriptions.push(
    vscode2.commands.registerCommand("json-visual-viewer.open", () => {
      JsonViewerPanel.createOrShow(context.extensionUri);
    })
  );
  context.subscriptions.push(
    vscode2.commands.registerCommand("json-visual-viewer.viewCurrent", () => {
      const editor = vscode2.window.activeTextEditor;
      JsonViewerPanel.createOrShow(context.extensionUri);
      if (editor) {
        JsonViewerPanel.currentPanel?.postJson(editor.document.getText());
      }
    })
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
