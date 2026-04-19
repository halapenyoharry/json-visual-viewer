import { Toolbar } from "./components/Toolbar";
import { Editor } from "./components/Editor";
import { SettingsSidebar } from "./components/SettingsSidebar";
import { useStore } from "./store/useStore";
import { getView } from "./viewsRegistry";
import "./App.css";

function App() {
  const showEditor = useStore((s) => s.showEditor);
  const viewMode = useStore((s) => s.viewMode);
  const showSettings = useStore((s) => s.showSettings);
  const ViewComponent = getView(viewMode).view;

  return (
    <div className="app">
      <Toolbar />
      <div className="app-body">
        {showEditor && <Editor />}
        <ViewComponent />
        {showSettings && <SettingsSidebar />}
      </div>
    </div>
  );
}

export default App;
