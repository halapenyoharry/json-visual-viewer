import { useStore } from "../store/useStore";
import type { CytoscapeLayout } from "../store/useStore";

const LAYOUTS: { value: CytoscapeLayout; label: string; hint: string }[] = [
  { value: "fcose", label: "fCoSE", hint: "Fast force-directed (recommended)" },
  { value: "cose", label: "CoSE", hint: "Classic force-directed" },
  { value: "breadthfirst", label: "Breadth-first", hint: "Hierarchy by depth" },
  { value: "concentric", label: "Concentric", hint: "Rings by degree" },
  { value: "circle", label: "Circle", hint: "All nodes on one circle" },
  { value: "grid", label: "Grid", hint: "Evenly spaced grid" },
  { value: "random", label: "Random", hint: "Random scatter" },
];

export function CytoscapeSettings() {
  const {
    cytoscapeLayout,
    setCytoscapeLayout,
    cytoscapeCurveEdges,
    setCytoscapeCurveEdges,
  } = useStore();

  return (
    <>
      <div className="settings-section">
        <div className="settings-section-title">Layout</div>
        <div className="settings-group" style={{ flexWrap: "wrap" }}>
          {LAYOUTS.map((l) => (
            <button
              key={l.value}
              className={`settings-btn ${cytoscapeLayout === l.value ? "active" : ""}`}
              style={{ flexBasis: "47%" }}
              onClick={() => setCytoscapeLayout(l.value)}
              title={l.hint}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Edges</div>
        <div className="settings-group">
          <button
            className={`settings-btn ${cytoscapeCurveEdges ? "active" : ""}`}
            onClick={() => setCytoscapeCurveEdges(true)}
            title="Curve parallel edges so multi-graphs are visible"
          >
            Curved
          </button>
          <button
            className={`settings-btn ${!cytoscapeCurveEdges ? "active" : ""}`}
            onClick={() => setCytoscapeCurveEdges(false)}
            title="Straight lines"
          >
            Straight
          </button>
        </div>
      </div>
    </>
  );
}
