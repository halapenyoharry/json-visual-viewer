import { Toolbar } from "./components/Toolbar";
import { Editor } from "./components/Editor";
import { TreeView } from "./components/TreeView";
import { ForceGraphView } from "./components/ForceGraphView";
import { SettingsSidebar } from "./components/SettingsSidebar";
import { useStore } from "./store/useStore";
import "./App.css";

function App() {
  const showEditor = useStore((s) => s.showEditor);
  const viewMode = useStore((s) => s.viewMode);
  const detectedGraph = useStore((s) => s.detectedGraph);
  const showSettings = useStore((s) => s.showSettings);

  return (
    <div className="app">
      <Toolbar />
      <div className="app-body">
        {showEditor && <Editor />}
        {viewMode === "graph" && detectedGraph ? (
          <ForceGraphView graph={detectedGraph} />
        ) : (
          <TreeView />
        )}
        {showSettings && <SettingsSidebar />}
      </div>
    </div>
  );
}

export default App;
