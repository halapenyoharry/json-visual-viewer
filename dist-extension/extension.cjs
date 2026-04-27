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

// src-vscode/provider.ts
var vscode = __toESM(require("vscode"), 1);
var fs = __toESM(require("fs"), 1);
var path = __toESM(require("path"), 1);
var JsonVisualViewerProvider = class {
  constructor(extensionUri) {
    this.extensionUri = extensionUri;
  }
  static viewType = "json-visual-viewer.editor";
  resolveCustomTextEditor(document, panel) {
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "dist-webview")]
    };
    panel.webview.html = this.buildHtml(panel.webview);
    let lastEditFromWebview = null;
    const docSub = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() !== document.uri.toString()) return;
      const text = document.getText();
      if (text === lastEditFromWebview) return;
      panel.webview.postMessage({ type: "setJson", json: text });
    });
    const msgSub = panel.webview.onDidReceiveMessage((msg) => {
      if (msg?.type === "ready") {
        panel.webview.postMessage({ type: "setJson", json: document.getText() });
        return;
      }
      if (msg?.type === "edit" && typeof msg.json === "string") {
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
  buildHtml(webview) {
    const distUri = vscode.Uri.joinPath(this.extensionUri, "dist-webview");
    const indexPath = path.join(distUri.fsPath, "index.html");
    let html = fs.readFileSync(indexPath, "utf8");
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
      `worker-src ${webview.cspSource} blob:`
    ].join("; ");
    html = html.replace(
      "<head>",
      `<head>
    <meta http-equiv="Content-Security-Policy" content="${csp}">`
    );
    return html;
  }
};

// src-vscode/extension.ts
function activate(context) {
  context.subscriptions.push(
    vscode2.window.registerCustomEditorProvider(
      JsonVisualViewerProvider.viewType,
      new JsonVisualViewerProvider(context.extensionUri),
      {
        webviewOptions: { retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false
      }
    )
  );
  context.subscriptions.push(
    vscode2.commands.registerCommand(
      "json-visual-viewer.viewCurrent",
      async (uri) => {
        const target = uri ?? vscode2.window.activeTextEditor?.document.uri;
        if (!target) {
          vscode2.window.showWarningMessage("No JSON file selected.");
          return;
        }
        await vscode2.commands.executeCommand(
          "vscode.openWith",
          target,
          JsonVisualViewerProvider.viewType,
          vscode2.ViewColumn.Beside
        );
      }
    )
  );
  context.subscriptions.push(
    vscode2.commands.registerCommand("json-visual-viewer.browse", async () => {
      const files = await vscode2.workspace.findFiles(
        "**/*.json",
        "**/{node_modules,dist,dist-extension,dist-webview,.git,_archive}/**",
        500
      );
      if (files.length === 0) {
        vscode2.window.showInformationMessage("No JSON files found in this workspace.");
        return;
      }
      const folders = vscode2.workspace.workspaceFolders ?? [];
      const items = files.map((uri) => {
        const rel = vscode2.workspace.asRelativePath(uri, folders.length > 1);
        const slash = rel.lastIndexOf("/");
        return {
          uri,
          label: slash >= 0 ? rel.slice(slash + 1) : rel,
          description: slash >= 0 ? rel.slice(0, slash) : ""
        };
      }).sort((a, b) => a.label.localeCompare(b.label));
      const picked = await vscode2.window.showQuickPick(items, {
        title: "JSON Visual Viewer \u2014 pick a file",
        matchOnDescription: true,
        placeHolder: "Type to filter\u2026"
      });
      if (!picked) return;
      await vscode2.commands.executeCommand(
        "vscode.openWith",
        picked.uri,
        JsonVisualViewerProvider.viewType,
        vscode2.ViewColumn.Beside
      );
    })
  );
  context.subscriptions.push(
    vscode2.commands.registerCommand("json-visual-viewer.open", async () => {
      const doc = await vscode2.workspace.openTextDocument({
        language: "json",
        content: "{}\n"
      });
      await vscode2.commands.executeCommand(
        "vscode.openWith",
        doc.uri,
        JsonVisualViewerProvider.viewType
      );
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
