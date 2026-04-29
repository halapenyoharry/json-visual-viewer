import { useMemo } from "react";
import { useStore } from "../store/useStore";
import { extractLayers } from "../utils/layers";
import "./LayerPanel.css";

export function LayerPanel() {
  const graph = useStore((s) => s.detectedGraph);
  const visibility = useStore((s) => s.layerVisibility);
  const setLayerVisibility = useStore((s) => s.setLayerVisibility);
  const setAllLayers = useStore((s) => s.setAllLayers);
  const toggleLayerPanel = useStore((s) => s.toggleLayerPanel);

  const layers = useMemo(() => extractLayers(graph), [graph]);
  const totalEdges = graph?.links.length ?? 0;
  const layeredEdges = layers.reduce((s, l) => s + l.count, 0);
  const unlayeredEdges = totalEdges - layeredEdges;

  return (
    <div className="layer-panel">
      <div className="layer-panel-header">
        <span className="layer-panel-title">Layers</span>
        <button
          className="layer-panel-close"
          onClick={toggleLayerPanel}
          title="Close layers panel"
        >
          ×
        </button>
      </div>
      {layers.length === 0 ? (
        <div className="layer-panel-empty">
          No <code>layer</code> field on edges in this graph.
        </div>
      ) : (
        <>
          <div className="layer-panel-actions">
            <button
              className="layer-panel-btn"
              onClick={() => setAllLayers(true)}
              title="Show all layers"
            >
              All
            </button>
            <button
              className="layer-panel-btn"
              onClick={() => setAllLayers(false)}
              title="Hide all layers"
            >
              None
            </button>
            <span className="layer-panel-count">
              {layers.length} layer{layers.length === 1 ? "" : "s"}
            </span>
          </div>
          <ul className="layer-panel-list">
            {layers.map((l) => {
              const on = visibility[l.name] !== false;
              return (
                <li key={l.name} className="layer-panel-item">
                  <label className="layer-panel-row">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) =>
                        setLayerVisibility(l.name, e.target.checked)
                      }
                    />
                    <span
                      className="layer-panel-swatch"
                      style={{ backgroundColor: l.color }}
                      aria-hidden
                    />
                    <span
                      className="layer-panel-name"
                      title={l.name}
                    >
                      {l.name}
                    </span>
                    <span className="layer-panel-edge-count">{l.count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          {unlayeredEdges > 0 && (
            <div className="layer-panel-footer">
              {unlayeredEdges} edge{unlayeredEdges === 1 ? "" : "s"} without a layer always shown.
            </div>
          )}
        </>
      )}
    </div>
  );
}
