import { Toolbar } from "./components/Toolbar";
import { Editor } from "./components/Editor";
import { ControlPanel } from "./components/ControlPanel";
import { useStore } from "./store/useStore";
import { getView } from "./viewsRegistry";
import "./App.css";

function App() {
  const showEditor = useStore((s) => s.showEditor);
  const viewMode = useStore((s) => s.viewMode);
  const showControlPanel = useStore((s) => s.showControlPanel);
  const ViewComponent = getView(viewMode).view;

  return (
    <div className="app">
      <Toolbar />
      <div className="app-body">
        {showEditor && <Editor />}
        <ViewComponent />
        {showControlPanel && <ControlPanel />}
      </div>
    </div>
  );
}

export default App;
