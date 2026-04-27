import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/useStore";
import { VIEWS, getView } from "../viewsRegistry";
import { openJsonFile, saveCurrentJson, exportCurrentViewAsSvg } from "../utils/fileIO";
import { Icon } from "./Icon";
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
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const viewMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!viewMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!viewMenuRef.current?.contains(e.target as Node)) {
        setViewMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [viewMenuOpen]);

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
        <div className="view-menu" ref={viewMenuRef}>
          <button
            className={`toolbar-btn view-menu-trigger ${viewMenuOpen ? "active" : ""}`}
            onClick={() => setViewMenuOpen((v) => !v)}
            title="Switch view"
          >
            View: {currentView.label} <span className="view-menu-caret">▾</span>
          </button>
          {viewMenuOpen && (
            <div className="view-menu-list" role="menu">
              {VIEWS.map((v, idx) => {
                const disabled = v.requiresGraph && !graphAvailable;
                return (
                  <button
                    key={v.id}
                    role="menuitem"
                    className={`view-menu-item ${viewMode === v.id ? "active" : ""} ${disabled ? "disabled" : ""}`}
                    onClick={() => {
                      if (disabled) return;
                      setViewMode(v.id);
                      setViewMenuOpen(false);
                    }}
                    title={disabled ? "No graph structure detected" : v.titleTip}
                  >
                    <span className="view-menu-item-label">{v.label}</span>
                    <span className="view-menu-item-shortcut">⌘{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="toolbar-divider" />
        <button
          className={`toolbar-btn ${showControlPanel ? "active" : ""}`}
          onClick={toggleControlPanel}
          title="Toggle control panel (⌘L)"
        >
          <Icon name="settings" style={{ marginRight: 6 }} /> Control Panel
        </button>
      </div>

      <div className="toolbar-right" data-tauri-drag-region>
        <span className="toolbar-hint dim">{currentView.hint}</span>
      </div>
    </div>
  );
}
