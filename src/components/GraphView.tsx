import { useRef, useCallback, useState } from "react";
import { JSONCrack } from "jsoncrack-react";
import type { JSONCrackRef } from "jsoncrack-react";
import "jsoncrack-react/style.css";
import { useStore } from "../store/useStore";
import "./GraphView.css";

export function GraphView() {
  const { json, layoutDirection } = useStore();
  const crackRef = useRef<JSONCrackRef>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCenter = useCallback(() => {
    crackRef.current?.centerView();
  }, []);

  const handleZoomIn = useCallback(() => {
    crackRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    crackRef.current?.zoomOut();
  }, []);

  return (
    <div className="graph-panel">
      {error && (
        <div className="graph-error">
          <span className="error-icon">!</span>
          <span>{error}</span>
        </div>
      )}
      <JSONCrack
        ref={crackRef}
        json={json}
        theme="dark"
        layoutDirection={layoutDirection}
        showControls={false}
        showGrid={false}
        trackpadZoom
        centerOnLayout
        style={{ width: "100%", height: "100%" }}
        onParseError={(err) => setError(err.message)}
        onParse={() => setError(null)}
        renderNodeLimitExceeded={(count, max) => (
          <div className="node-limit-warning">
            Too many nodes ({count}). Max: {max}. Try a smaller JSON.
          </div>
        )}
      />
      <div className="graph-controls">
        <button className="graph-ctrl-btn" onClick={handleZoomIn} title="Zoom in">+</button>
        <button className="graph-ctrl-btn" onClick={handleZoomOut} title="Zoom out">−</button>
        <button className="graph-ctrl-btn" onClick={handleCenter} title="Center view">⊙</button>
      </div>
    </div>
  );
}
