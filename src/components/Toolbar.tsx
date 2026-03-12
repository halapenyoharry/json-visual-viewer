import type { LayoutDirection } from "jsoncrack-react";
import { useStore } from "../store/useStore";
import "./Toolbar.css";

const LAYOUTS: { value: LayoutDirection; label: string }[] = [
  { value: "RIGHT", label: "→" },
  { value: "DOWN", label: "↓" },
  { value: "LEFT", label: "←" },
  { value: "UP", label: "↑" },
];

export function Toolbar() {
  const { layoutDirection, setLayoutDirection, showEditor, toggleEditor } =
    useStore();

  const handleFileOpen = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.jsonc";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        useStore.getState().setJson(text);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="toolbar" data-tauri-drag-region>
      <div className="toolbar-controls">
        <button className="toolbar-btn" onClick={handleFileOpen} title="Open JSON file">
          Open
        </button>
        <button
          className={`toolbar-btn ${showEditor ? "active" : ""}`}
          onClick={toggleEditor}
          title="Toggle editor"
        >
          Editor
        </button>
        <div className="toolbar-divider" />
        <div className="layout-group">
          {LAYOUTS.map((l) => (
            <button
              key={l.value}
              className={`toolbar-btn layout-btn ${layoutDirection === l.value ? "active" : ""}`}
              onClick={() => setLayoutDirection(l.value)}
              title={`Layout: ${l.value}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-right" data-tauri-drag-region>
        <span className="toolbar-hint dim">Scroll to zoom · Drag to pan</span>
      </div>
    </div>
  );
}
