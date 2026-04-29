import { useEffect } from "react";
import { Toolbar } from "./components/Toolbar";
import { Editor } from "./components/Editor";
import { ControlPanel } from "./components/ControlPanel";
import { DragDivider } from "./components/DragDivider";
import { ViewErrorBoundary } from "./components/ViewErrorBoundary";
import { LayerPanel } from "./components/LayerPanel";
import { useStore } from "./store/useStore";
import { VIEWS, getView } from "./viewsRegistry";
import { openJsonFile, saveCurrentJson, exportCurrentViewAsSvg } from "./utils/fileIO";
import "./App.css";

const LAYERS_SUPPORTED: Record<string, boolean> = {
  graph: true,
  graph3d: true,
  cytoscape: true,
};

function App() {
  const showEditor = useStore((s) => s.showEditor);
  const viewMode = useStore((s) => s.viewMode);
  const showControlPanel = useStore((s) => s.showControlPanel);
  const showLayerPanel = useStore((s) => s.showLayerPanel);
  const graphAvailable = useStore((s) => s.graphAvailable);
  const view = getView(viewMode);
  const ViewComponent = view.view;
  const showLayers =
    showLayerPanel && LAYERS_SUPPORTED[viewMode] === true && graphAvailable;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (!cmd) return;

      switch (e.key.toLowerCase()) {
        case "o":
          e.preventDefault();
          openJsonFile();
          return;
        case "s":
          e.preventDefault();
          saveCurrentJson();
          return;
        case "e":
          e.preventDefault();
          useStore.getState().toggleEditor();
          return;
        case "l":
          e.preventDefault();
          useStore.getState().toggleControlPanel();
          return;
        case "p":
          if (e.shiftKey) {
            e.preventDefault();
            exportCurrentViewAsSvg();
          }
          return;
      }

      if (/^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        const target = VIEWS[idx];
        if (!target) return;
        if (target.requiresGraph && !useStore.getState().graphAvailable) return;
        e.preventDefault();
        useStore.getState().setViewMode(target.id);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="app">
      <Toolbar />
      <div className="app-body">
        {showEditor && (
          <>
            <Editor />
            <DragDivider
              onChange={(x) =>
                useStore.getState().setEditorWidth(
                  Math.max(200, Math.min(x, window.innerWidth - 240))
                )
              }
              onReset={() => useStore.getState().setEditorWidth(400)}
            />
          </>
        )}
        <div className="view-stack">
          <ViewErrorBoundary key={viewMode} viewLabel={view.label}>
            <ViewComponent />
          </ViewErrorBoundary>
          {showLayers && <LayerPanel />}
        </div>
        {showControlPanel && <ControlPanel />}
      </div>
    </div>
  );
}

export default App;
