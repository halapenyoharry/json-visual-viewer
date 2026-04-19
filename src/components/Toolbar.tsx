import { useStore } from "../store/useStore";
import { VIEWS, getView } from "../viewsRegistry";
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
          {VIEWS.map((v) => {
            const disabled = v.requiresGraph && !graphAvailable;
            const title = disabled ? "No graph structure detected" : v.titleTip;
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
          title="Toggle control panel"
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
