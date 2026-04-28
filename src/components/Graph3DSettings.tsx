import { useStore } from "../store/useStore";
import type { Graph3DLabelMode } from "../store/useStore";

const LABEL_MODES: { value: Graph3DLabelMode; label: string; hint: string }[] = [
  { value: "always", label: "Always", hint: "Inline edge labels along the arrow" },
  { value: "hover", label: "Hover", hint: "Show label as tooltip on hover" },
  { value: "never", label: "Never", hint: "No labels" },
];

export function Graph3DSettings() {
  const {
    graph3dDimensions,
    setGraph3dDimensions,
    graph3dParticles,
    setGraph3dParticles,
    graph3dLabelMode,
    setGraph3dLabelMode,
    graph3dCurvature,
    setGraph3dCurvature,
  } = useStore();

  return (
    <>
      <div className="settings-section">
        <div className="settings-section-title">Dimensions</div>
        <div className="settings-group">
          <button
            className={`settings-btn ${graph3dDimensions === 2 ? "active" : ""}`}
            onClick={() => setGraph3dDimensions(2)}
            title="Flat 2D layout (WebGL)"
          >
            2D
          </button>
          <button
            className={`settings-btn ${graph3dDimensions === 3 ? "active" : ""}`}
            onClick={() => setGraph3dDimensions(3)}
            title="3D layout (rotate / zoom)"
          >
            3D
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Edge Labels</div>
        <div className="settings-group" style={{ flexWrap: "wrap" }}>
          {LABEL_MODES.map((m) => (
            <button
              key={m.value}
              className={`settings-btn ${graph3dLabelMode === m.value ? "active" : ""}`}
              onClick={() => setGraph3dLabelMode(m.value)}
              title={m.hint}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Directional Particles</div>
        <div className="settings-group">
          <button
            className={`settings-btn ${graph3dParticles ? "active" : ""}`}
            onClick={() => setGraph3dParticles(true)}
            title="Show flowing dots along edges"
          >
            On
          </button>
          <button
            className={`settings-btn ${!graph3dParticles ? "active" : ""}`}
            onClick={() => setGraph3dParticles(false)}
            title="Hide flow particles"
          >
            Off
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">
          Multi-Graph Curvature: {graph3dCurvature.toFixed(2)}
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={graph3dCurvature}
          onChange={(e) => setGraph3dCurvature(Number(e.target.value))}
          style={{ width: "100%" }}
          title="How wide parallel edges fan around the source-target axis"
        />
      </div>
    </>
  );
}
