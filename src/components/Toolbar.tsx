import { useStore } from "../store/useStore";
import "./Toolbar.css";

export function Toolbar() {
  const {
    showEditor,
    toggleEditor,
    viewMode,
    setViewMode,
    graphAvailable,
    isExplodedView,
    setIsExplodedView,
    showSettings,
    toggleSettings,
  } = useStore();

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
        const store = useStore.getState();
        store.setJson(text);
        // Auto-switch to graph view if graph detected
        if (store.graphAvailable) {
          store.setViewMode("graph");
        } else {
          store.setViewMode("tree");
        }
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
          <button
            className={`toolbar-btn ${viewMode === "tree" ? "active" : ""}`}
            onClick={() => setViewMode("tree")}
            title="Tree view (structural)"
          >
            Tree
          </button>
          <button
            className={`toolbar-btn ${viewMode === "graph" ? "active" : ""} ${!graphAvailable ? "disabled" : ""}`}
            onClick={() => graphAvailable && setViewMode("graph")}
            title={graphAvailable ? "Graph view (relational)" : "No graph structure detected"}
          >
            Graph
          </button>
          <button
            className={`toolbar-btn ${viewMode === "circles" ? "active" : ""}`}
            onClick={() => setViewMode("circles")}
            title="Circles view (zoomable circle packing)"
          >
            Circles
          </button>
        </div>
        <div className="toolbar-divider" />
        {(viewMode === "tree" || viewMode === "circles") && (
          <div className="layout-group">
            <button
              className={`toolbar-btn layout-btn ${isExplodedView ? "active" : ""}`}
              onClick={() => setIsExplodedView(!isExplodedView)}
              title="Explode primitive values into individual nodes"
            >
              Explode
            </button>
          </div>
        )}
        {(viewMode === "tree" || viewMode === "graph") && <div className="toolbar-divider" />}
        <button
          className={`toolbar-btn ${showSettings ? "active" : ""}`}
          onClick={toggleSettings}
          title="Toggle settings panel"
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="toolbar-right" data-tauri-drag-region>
        <span className="toolbar-hint dim">
          {viewMode === "graph" ? "Drag nodes · Scroll to zoom" : "Scroll to zoom · Drag to pan"}
        </span>
      </div>
    </div>
  );
}
