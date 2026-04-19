import { useStore } from "../store/useStore";
import { FontPicker } from "./FontPicker";
import { getView } from "../viewsRegistry";
import "./ControlPanel.css";

export function ControlPanel() {
  const viewMode = useStore((s) => s.viewMode);
  const view = getView(viewMode);
  const ViewSettings = view.settings;

  return (
    <div className="settings-sidebar">
      <div className="settings-header">{view.label} Control Panel</div>
      <ViewSettings />
      <div className="settings-section">
        <div className="settings-section-title">Editor Font</div>
        <FontPicker />
      </div>
    </div>
  );
}
