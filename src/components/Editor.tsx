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
              // Matched to jsoncrack-react dark theme node colors
              { token: "string.key.json", foreground: "59b8ff" },   // keys — matches node key color
              { token: "string.value.json", foreground: "DCE5E7" }, // string values — matches node value color
              { token: "number", foreground: "e8c479" },            // numbers — matches node integer color
              { token: "keyword.json", foreground: "00DC7D" },      // true/null/false get keyword token
              { token: "keyword", foreground: "939598" },           // fallback keyword
              { token: "delimiter", foreground: "636363" },         // brackets, commas
            ],
            colors: {
              "editor.background": "#080c22",
              "editor.foreground": "#DCE5E7",
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
