import { useStore } from "../store/useStore";
import { VIEWS, getView } from "../viewsRegistry";
import { openJsonFile, saveCurrentJson, exportCurrentViewAsSvg } from "../utils/fileIO";
import "./Toolbar.css";

export function Toolbar() {
  const {
    showEditor,
    toggleEditor,
    viewMode,
    setViewMode,
    graphAvailable,
    showControlPanel,
    toggleControlPanel,
  } = useStore();

  const currentView = getView(viewMode);

  return (
    <div className="toolbar" data-tauri-drag-region>
      <div className="toolbar-controls">
        <button className="toolbar-btn" onClick={openJsonFile} title="Open JSON file (⌘O)">
          Open
        </button>
        <button className="toolbar-btn" onClick={saveCurrentJson} title="Save JSON (⌘S)">
          Save
        </button>
        <button
          className="toolbar-btn"
          onClick={exportCurrentViewAsSvg}
          title="Export current view as SVG (⌘⇧P)"
        >
          Export SVG
        </button>
        <div className="toolbar-divider" />
        <button
          className={`toolbar-btn ${showEditor ? "active" : ""}`}
          onClick={toggleEditor}
          title="Toggle editor (⌘E)"
        >
          Editor
        </button>
        <div className="toolbar-divider" />
        <div className="layout-group">
          {VIEWS.map((v, idx) => {
            const disabled = v.requiresGraph && !graphAvailable;
            const title = disabled
              ? "No graph structure detected"
              : `${v.titleTip} (⌘${idx + 1})`;
            return (
              <button
                key={v.id}
                className={`toolbar-btn ${viewMode === v.id ? "active" : ""} ${disabled ? "disabled" : ""}`}
                onClick={() => !disabled && setViewMode(v.id)}
                title={title}
              >
                {v.label}
              </button>
            );
          })}
        </div>
        <div className="toolbar-divider" />
        <button
          className={`toolbar-btn ${showControlPanel ? "active" : ""}`}
          onClick={toggleControlPanel}
          title="Toggle control panel (⌘L)"
        >
          ⚙️ Control Panel
        </button>
      </div>

      <div className="toolbar-right" data-tauri-drag-region>
        <span className="toolbar-hint dim">{currentView.hint}</span>
      </div>
    </div>
  );
}
