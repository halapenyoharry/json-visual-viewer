import MonacoEditor from "@monaco-editor/react";
import { useStore } from "../store/useStore";
import "./Editor.css";

export function Editor() {
  const { json, setJson } = useStore();

  return (
    <div className="editor-panel">
      <MonacoEditor
        language="json"
        value={json}
        onChange={(value) => setJson(value ?? "")}
        theme="midnight-alaska"
        beforeMount={(monaco) => {
          monaco.editor.defineTheme("midnight-alaska", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { token: "string.key.json", foreground: "18ffff" },
              { token: "string.value.json", foreground: "ff9800" },
              { token: "number", foreground: "00e5ff" },
              { token: "keyword", foreground: "00e5ff" },
              { token: "delimiter", foreground: "00d4ee" },
            ],
            colors: {
              "editor.background": "#080c22",
              "editor.foreground": "#18ffff",
              "editor.lineHighlightBackground": "#0d122580",
              "editor.selectionBackground": "#1a237e60",
              "editorCursor.foreground": "#00e5ff",
              "editorLineNumber.foreground": "#1a237e",
              "editorLineNumber.activeForeground": "#00d4ee",
              "editor.selectionHighlightBackground": "#1a237e40",
              "editorIndentGuide.background": "#1a237e30",
              "editorIndentGuide.activeBackground": "#1a237e60",
              "editorBracketMatch.background": "#1a237e40",
              "editorBracketMatch.border": "#00e5ff50",
              "scrollbarSlider.background": "#00e5ff15",
              "scrollbarSlider.hoverBackground": "#00e5ff30",
              "editorWidget.background": "#080c22",
              "editorWidget.border": "#00e5ff30",
              "input.background": "#0a0e27",
              "input.border": "#00e5ff30",
              "input.foreground": "#18ffff",
            },
          });
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 12 },
          renderLineHighlight: "gutter",
          guides: {
            indentation: true,
            bracketPairs: true,
          },
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
        }}
      />
    </div>
  );
}
