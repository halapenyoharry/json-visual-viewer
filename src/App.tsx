import { Toolbar } from "./components/Toolbar";
import { Editor } from "./components/Editor";
import { GraphView } from "./components/GraphView";
import { useStore } from "./store/useStore";
import "./App.css";

function App() {
  const showEditor = useStore((s) => s.showEditor);

  return (
    <div className="app">
      <Toolbar />
      <div className="app-body">
        {showEditor && <Editor />}
        <GraphView />
      </div>
    </div>
  );
}

export default App;
