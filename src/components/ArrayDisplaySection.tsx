import { useStore } from "../store/useStore";

export function ArrayDisplaySection() {
  const showArrayIndices = useStore((s) => s.showArrayIndices);
  const setShowArrayIndices = useStore((s) => s.setShowArrayIndices);

  return (
    <div className="settings-section">
      <div className="settings-section-title">Array Display</div>
      <div className="settings-group">
        <button
          className={`settings-btn ${showArrayIndices ? "active" : ""}`}
          style={{ flex: 1 }}
          onClick={() => setShowArrayIndices(true)}
        >
          Show [0] [1]
        </button>
        <button
          className={`settings-btn ${!showArrayIndices ? "active" : ""}`}
          style={{ flex: 1 }}
          onClick={() => setShowArrayIndices(false)}
        >
          Hide indices
        </button>
      </div>
    </div>
  );
}
