import { Toolbar } from "./components/Toolbar";
import { Editor } from "./components/Editor";
import { TreeView } from "./components/TreeView";
import { ForceGraphView } from "./components/ForceGraphView";
import { CirclesView } from "./components/CirclesView";
import { SettingsSidebar } from "./components/SettingsSidebar";
import { useStore } from "./store/useStore";
import "./App.css";

function App() {
  const showEditor = useStore((s) => s.showEditor);
  const viewMode = useStore((s) => s.viewMode);
  const detectedGraph = useStore((s) => s.detectedGraph);
  const showSettings = useStore((s) => s.showSettings);

  const renderView = () => {
    if (viewMode === "graph" && detectedGraph) {
      return <ForceGraphView graph={detectedGraph} />;
    }
    if (viewMode === "circles") {
      return <CirclesView />;
    }
    return <TreeView />;
  };

  return (
    <div className="app">
      <Toolbar />
      <div className="app-body">
        {showEditor && <Editor />}
        {renderView()}
        {showSettings && <SettingsSidebar />}
      </div>
    </div>
  );
}

export default App;
