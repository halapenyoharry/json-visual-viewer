import { useStore } from "../store/useStore";

export function ExplodeToggle() {
  const isExplodedView = useStore((s) => s.isExplodedView);
  const setIsExplodedView = useStore((s) => s.setIsExplodedView);

  return (
    <div className="settings-section">
      <div className="settings-section-title">Explode Primitives</div>
      <div className="settings-group">
        <button
          className={`settings-btn ${!isExplodedView ? "active" : ""}`}
          style={{ flex: 1 }}
          onClick={() => setIsExplodedView(false)}
        >
          Compact
        </button>
        <button
          className={`settings-btn ${isExplodedView ? "active" : ""}`}
          style={{ flex: 1 }}
          onClick={() => setIsExplodedView(true)}
        >
          Exploded
        </button>
      </div>
    </div>
  );
}
